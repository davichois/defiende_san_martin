// Recibe el registro de un personero y lo guarda en Supabase (tabla public.personeros).
// Esquema: supabase/migrations/0001_personeros.sql · Cliente: app/lib/supabase.ts
import { supabaseAdmin } from "../../lib/supabase";
import { REGION, validar, type Registro } from "../../unirse/schema";

const texto = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body)
    return Response.json({ error: "Solicitud inválida" }, { status: 400 });

  const registro: Registro = {
    dni: texto(body.dni),
    nombre: texto(body.nombre),
    telefono: texto(body.telefono),
    correo: texto(body.correo),
    provincia: texto(body.provincia),
    distrito: texto(body.distrito),
    experiencia: body.experiencia === true,
    detalleExperiencia: texto(body.detalleExperiencia),
    acepta: body.acepta === true,
  };
  const errores = validar(registro);
  if (Object.keys(errores).length)
    return Response.json({ errores }, { status: 422 });

  const db = supabaseAdmin();
  if (!db)
    return Response.json(
      { error: "Registro no configurado (faltan las claves de Supabase)." },
      { status: 503 },
    );

  const { error } = await db.from("personeros").insert({
    dni: registro.dni,
    nombre: registro.nombre,
    telefono: registro.telefono,
    correo: registro.correo || null,
    region: REGION,
    provincia: registro.provincia,
    distrito: registro.distrito,
    experiencia: registro.experiencia,
    detalle_experiencia: registro.experiencia
      ? registro.detalleExperiencia
      : null,
    acepta_datos: registro.acepta,
  });

  if (error) {
    // 23505 = DNI ya registrado (restricción unique)
    if (error.code === "23505")
      return Response.json(
        {
          errores: { dni: "Este DNI ya está registrado como personero." },
          error: "Ya estás registrado. ¡Gracias por sumarte!",
        },
        { status: 409 },
      );
    console.error("Supabase insert personeros:", error.message);
    return Response.json(
      { error: "No se pudo guardar el registro. Inténtalo de nuevo." },
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
}
