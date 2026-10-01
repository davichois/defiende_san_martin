// Reglas del formulario de personeros, compartidas por el navegador y el servidor.
// La campaña es solo en San Martín: la región es fija y se eligen provincia y distrito.
import ubigeo from "./ubigeo.json";

export const REGION = "SAN MARTIN";
export const PROVINCIAS = ubigeo as Record<string, string[]>;

export type Registro = {
  dni: string;
  nombre: string;
  telefono: string;
  correo: string;
  provincia: string;
  distrito: string;
  experiencia: boolean;
  detalleExperiencia: string;
  acepta: boolean;
};

export type Errores = Partial<Record<keyof Registro, string>>;

export const esDni = (v: string) => /^\d{8}$/.test(v);

export function validar(r: Registro): Errores {
  const e: Errores = {};
  if (!esDni(r.dni)) e.dni = "El DNI debe tener 8 dígitos.";
  if (r.nombre.trim().length < 5) e.nombre = "Escribe tu nombre completo.";
  if (!/^9\d{8}$/.test(r.telefono))
    e.telefono = "Celular de 9 dígitos que empiece con 9.";
  if (r.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.correo))
    e.correo = "Revisa el correo.";
  if (!PROVINCIAS[r.provincia]) e.provincia = "Selecciona la provincia.";
  else if (!PROVINCIAS[r.provincia].includes(r.distrito))
    e.distrito = "Selecciona el distrito.";
  if (r.experiencia && r.detalleExperiencia.trim().length < 5)
    e.detalleExperiencia = "Cuéntanos brevemente tu experiencia.";
  if (!r.acepta) e.acepta = "Necesitamos tu autorización para registrarte.";
  return e;
}
