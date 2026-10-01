// Autocompleta el nombre a partir del DNI (ver app/lib/dni.ts).
// Opcional en .env.local:
//   DNI_API_URL=https://api.apis.net.pe/v1/dni   (valor por defecto)
//   DNI_API_TOKEN=tu_token                      (si la API lo pide)
// Si la API falla se intenta el respaldo; si ambos fallan, el formulario deja escribir el nombre.
import { consultarDni } from "../../lib/dni";
import { esDni } from "../../unirse/schema";

// Límite por visitante para que el endpoint no sirva para averiguar nombres en masa.
// En memoria: suficiente para un solo servidor; con varias instancias usar un store compartido.
const VENTANA_MS = 10 * 60 * 1000;
const MAX_CONSULTAS = 10;
const consultas = new Map<string, { n: number; desde: number }>();

function permitido(ip: string) {
  const ahora = Date.now();
  const r = consultas.get(ip);
  if (!r || ahora - r.desde > VENTANA_MS) {
    consultas.set(ip, { n: 1, desde: ahora });
    if (consultas.size > 5000) consultas.clear();
    return true;
  }
  r.n += 1;
  return r.n <= MAX_CONSULTAS;
}

export async function GET(request: Request) {
  const numero = new URL(request.url).searchParams.get("numero") ?? "";
  if (!esDni(numero))
    return Response.json({ error: "DNI inválido" }, { status: 400 });

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "local";
  if (!permitido(ip))
    return Response.json(
      { error: "Demasiadas consultas. Intenta en unos minutos." },
      { status: 429 },
    );

  const r = await consultarDni(numero);
  if (!r.ok)
    return Response.json(
      { error: r.error },
      { status: r.notFound ? 404 : 502 },
    );

  const { nombres, apellidoPaterno, apellidoMaterno } = r.data;
  const nombre = [nombres, apellidoPaterno, apellidoMaterno]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  // Solo se devuelve el nombre: la dirección u otros datos no hacen falta en el formulario.
  // La afiliación no sale de RENIEC: queda "por verificar" hasta cruzarla con el padrón.
  return Response.json({ nombre, afiliado: null });
}
