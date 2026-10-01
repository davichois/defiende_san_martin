// ─────────────────────────────────────────────────────────────
// CONSULTA DE DNI (RENIEC) — API con respaldo de scraping
// Solo servidor: la usa /api/dni.
// ─────────────────────────────────────────────────────────────

export type DniData = {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  direccion?: string;
  distrito?: string;
  provincia?: string;
  departamento?: string;
};

export type DniLookup =
  | { ok: true; data: DniData }
  | { ok: false; error: string; notFound?: boolean };

export async function consultarDni(dni: string): Promise<DniLookup> {
  const numero = (dni || "").replace(/\D/g, "");
  if (numero.length !== 8) {
    return { ok: false, error: "El DNI debe tener 8 dígitos." };
  }
  const primary = await consultarDniApi(numero);
  if (primary.ok) return primary;
  const fallback = await scrapeEldni(numero);
  if (fallback.ok) return fallback;
  return primary;
}

async function consultarDniApi(numero: string): Promise<DniLookup> {
  const base = process.env.DNI_API_URL || "https://api.apis.net.pe/v1/dni";
  const token = process.env.DNI_API_TOKEN;
  try {
    const res = await fetch(`${base}?numero=${numero}`, {
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403)
        return { ok: false, error: "La API requiere token (DNI_API_TOKEN)." };
      if (res.status === 404)
        return {
          ok: false,
          error: "No se encontró una persona con ese DNI.",
          notFound: true,
        };
      if (res.status === 422) return { ok: false, error: "DNI inválido." };
      return { ok: false, error: `La API respondió HTTP ${res.status}.` };
    }
    const j = (await res.json()) as Record<string, string | undefined>;
    const nombres = j.nombres ?? j.name ?? j.first_name ?? "";
    const apellidoPaterno =
      j.apellidoPaterno ?? j.apellido_paterno ?? j.first_last_name ?? "";
    const apellidoMaterno =
      j.apellidoMaterno ?? j.apellido_materno ?? j.second_last_name ?? "";
    if (!nombres && !apellidoPaterno && !j.nombre)
      return { ok: false, error: "La API no devolvió datos para ese DNI." };
    return {
      ok: true,
      data: {
        nombres: nombres || j.nombre || "",
        apellidoPaterno,
        apellidoMaterno,
        direccion: j.direccion ?? j.address ?? undefined,
        distrito: j.distrito ?? undefined,
        provincia: j.provincia ?? undefined,
        departamento: j.departamento ?? undefined,
      },
    };
  } catch {
    return { ok: false, error: "No hay conexión con la API de DNI." };
  }
}

// Los valores del HTML vienen con entidades (p. ej. "PE&Ntilde;A").
const ENTIDADES: Record<string, string> = {
  amp: "&",
  quot: '"',
  apos: "'",
  lt: "<",
  gt: ">",
  nbsp: " ",
  Ntilde: "Ñ",
  ntilde: "ñ",
  Aacute: "Á",
  Eacute: "É",
  Iacute: "Í",
  Oacute: "Ó",
  Uacute: "Ú",
  aacute: "á",
  eacute: "é",
  iacute: "í",
  oacute: "ó",
  uacute: "ú",
  Uuml: "Ü",
  uuml: "ü",
};
const decodificar = (s: string) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) =>
      String.fromCharCode(parseInt(n, 16)),
    )
    .replace(/&([a-z]+);/gi, (m, e) => ENTIDADES[e] ?? m)
    .trim();

async function scrapeEldni(numero: string): Promise<DniLookup> {
  const url = "https://eldni.com/pe/buscar-datos-por-dni";
  const ua =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36";
  try {
    const getRes = await fetch(url, {
      headers: { "User-Agent": ua },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!getRes.ok)
      return { ok: false, error: "El respaldo no está disponible." };
    const page = await getRes.text();
    const token = page.match(/name="_token"\s+value="([^"]+)"/)?.[1];
    if (!token)
      return {
        ok: false,
        error: "No se pudo iniciar la consulta de respaldo.",
      };
    const setCookies =
      typeof getRes.headers.getSetCookie === "function"
        ? getRes.headers.getSetCookie()
        : [getRes.headers.get("set-cookie")].filter(
            Boolean as unknown as (v: string | null) => v is string,
          );
    const cookie = setCookies.map((c) => c.split(";")[0]).join("; ");
    const postRes = await fetch(url, {
      method: "POST",
      headers: {
        "User-Agent": ua,
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: url,
        Origin: "https://eldni.com",
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: new URLSearchParams({ _token: token, dni: numero }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!postRes.ok)
      return {
        ok: false,
        error: `El respaldo respondió HTTP ${postRes.status}.`,
      };
    const html = await postRes.text();
    const nombres = html.match(/id="nombres"[^>]*value="([^"]*)"/i)?.[1] ?? "";
    const apellidoPaterno =
      html.match(/id="apellidop"[^>]*value="([^"]*)"/i)?.[1] ?? "";
    const apellidoMaterno =
      html.match(/id="apellidom"[^>]*value="([^"]*)"/i)?.[1] ?? "";
    if (!nombres && !apellidoPaterno)
      return {
        ok: false,
        error: "No se encontraron datos para ese DNI.",
        notFound: true,
      };
    return {
      ok: true,
      data: {
        nombres: decodificar(nombres),
        apellidoPaterno: decodificar(apellidoPaterno),
        apellidoMaterno: decodificar(apellidoMaterno),
      },
    };
  } catch {
    return { ok: false, error: "No se pudo consultar la fuente de respaldo." };
  }
}
