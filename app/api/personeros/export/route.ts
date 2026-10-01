// Descarga en Excel de los personeros registrados en Supabase. Protegido por contraseña:
//   ADMIN_EXPORT_PASSWORD=...   en .env.local (se compara solo en el servidor)
// Se pide con POST { password } desde el acceso oculto del bigote (tres toques).
import { timingSafeEqual } from "node:crypto";
import ExcelJS from "exceljs";
import { supabaseAdmin } from "../../../lib/supabase";

// Límite de intentos por visitante, para que la contraseña no se pueda adivinar a fuerza bruta.
const VENTANA_MS = 15 * 60 * 1000;
const MAX_INTENTOS = 5;
const intentos = new Map<string, { n: number; desde: number }>();

function bloqueado(ip: string) {
  const r = intentos.get(ip);
  return !!r && Date.now() - r.desde < VENTANA_MS && r.n >= MAX_INTENTOS;
}
function fallo(ip: string) {
  const ahora = Date.now();
  const r = intentos.get(ip);
  if (!r || ahora - r.desde > VENTANA_MS)
    intentos.set(ip, { n: 1, desde: ahora });
  else r.n += 1;
}

function igual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

type Fila = {
  dni: string;
  nombre: string;
  telefono: string;
  correo: string | null;
  region: string;
  provincia: string;
  distrito: string;
  experiencia: boolean;
  detalle_experiencia: string | null;
  created_at: string;
};

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "local";
  if (bloqueado(ip))
    return Response.json(
      { error: "Demasiados intentos. Espera unos minutos." },
      { status: 429 },
    );

  const esperada = process.env.ADMIN_EXPORT_PASSWORD;
  if (!esperada)
    return Response.json(
      { error: "Exportación no configurada." },
      { status: 503 },
    );

  const body = (await request.json().catch(() => null)) as {
    password?: unknown;
  } | null;
  const password = typeof body?.password === "string" ? body.password : "";
  if (!igual(password, esperada)) {
    fallo(ip);
    return Response.json({ error: "Contraseña incorrecta." }, { status: 401 });
  }
  intentos.delete(ip);

  const db = supabaseAdmin();
  if (!db)
    return Response.json(
      { error: "Supabase no está configurado." },
      { status: 503 },
    );

  // Supabase devuelve como máximo 1000 filas por consulta: se pide por páginas.
  const filas: Fila[] = [];
  for (let desde = 0; ; desde += 1000) {
    const { data, error } = await db
      .from("personeros")
      .select(
        "dni, nombre, telefono, correo, region, provincia, distrito, experiencia, detalle_experiencia, created_at",
      )
      .order("created_at", { ascending: true })
      .range(desde, desde + 999);
    if (error) {
      console.error("Supabase select personeros:", error.message);
      return Response.json(
        { error: "No se pudo leer Supabase." },
        { status: 502 },
      );
    }
    filas.push(...(data as Fila[]));
    if (!data || data.length < 1000) break;
  }

  const libro = new ExcelJS.Workbook();
  libro.creator = "David Landa · Personeros";
  libro.created = new Date();
  const hoja = libro.addWorksheet("Personeros", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  hoja.columns = [
    { header: "N.º", key: "n", width: 6 },
    { header: "DNI", key: "dni", width: 12 },
    { header: "Nombre completo", key: "nombre", width: 36 },
    { header: "Celular", key: "telefono", width: 13 },
    { header: "Correo", key: "correo", width: 28 },
    { header: "Región", key: "region", width: 14 },
    { header: "Provincia", key: "provincia", width: 20 },
    { header: "Distrito", key: "distrito", width: 24 },
    { header: "Experiencia previa", key: "experiencia", width: 18 },
    { header: "Detalle de experiencia", key: "detalle", width: 40 },
    { header: "Fecha de registro", key: "fecha", width: 20 },
  ];
  filas.forEach((f, i) =>
    hoja.addRow({
      n: i + 1,
      dni: f.dni,
      nombre: f.nombre,
      telefono: f.telefono,
      correo: f.correo ?? "",
      region: f.region,
      provincia: f.provincia,
      distrito: f.distrito,
      experiencia: f.experiencia ? "Sí" : "No",
      detalle: f.detalle_experiencia ?? "",
      fecha: new Date(f.created_at).toLocaleString("es-PE", {
        timeZone: "America/Lima",
      }),
    }),
  );
  const cabecera = hoja.getRow(1);
  cabecera.font = { bold: true, color: { argb: "FFFFFFFF" } };
  cabecera.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFF6A1A" },
  };
  cabecera.alignment = { vertical: "middle" };
  cabecera.height = 22;
  hoja.autoFilter = { from: "A1", to: "K1" };
  // DNI y celular como texto para que Excel no quite ceros a la izquierda
  hoja.getColumn("dni").numFmt = "@";
  hoja.getColumn("telefono").numFmt = "@";

  const buffer = await libro.xlsx.writeBuffer();
  const fecha = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Lima",
  });
  return new Response(buffer as ArrayBuffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="personeros-san-martin-${fecha}.xlsx"`,
      "Cache-Control": "no-store",
      "X-Total-Personeros": String(filas.length),
    },
  });
}
