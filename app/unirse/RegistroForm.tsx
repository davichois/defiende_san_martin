"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import {
  PROVINCIAS,
  esDni,
  validar,
  type Errores,
  type Registro,
} from "./schema";

const VACIO: Registro = {
  dni: "",
  nombre: "",
  telefono: "",
  correo: "",
  provincia: "",
  distrito: "",
  experiencia: false,
  detalleExperiencia: "",
  acepta: false,
};

// Campos de cada paso. En escritorio se ven los tres a la vez; en celular, uno por pantalla.
const PASOS: { titulo: string; campos: (keyof Registro)[] }[] = [
  {
    titulo: "Datos personales",
    campos: ["dni", "nombre", "telefono", "correo"],
  },
  { titulo: "Dónde apoyarás", campos: ["provincia", "distrito"] },
  {
    titulo: "Tu experiencia",
    campos: ["experiencia", "detalleExperiencia", "acepta"],
  },
];
const pasoDe = (k: keyof Registro) =>
  PASOS.findIndex((p) => p.campos.includes(k));

// idle: sin validar · ok: nombre de RENIEC · manual: sin servicio, se escribe a mano
type EstadoDni = "idle" | "cargando" | "ok" | "manual";

function Flecha({ atras = false }: { atras?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden>
      <path
        d={
          atras ? "M13 8H4M7.5 4.5 4 8l3.5 3.5" : "M3 8h9M8.5 4.5 12 8l-3.5 3.5"
        }
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Paso({ i, children }: { i: number; children: ReactNode }) {
  return (
    <section className="fl-step" data-n={i}>
      <h2 className="fl-title">
        <span className="fl-num">0{i + 1}</span>
        {PASOS[i].titulo}
      </h2>
      {children}
    </section>
  );
}

export default function RegistroForm() {
  const [f, setF] = useState<Registro>(VACIO);
  const [errores, setErrores] = useState<Errores>({});
  const [paso, setPaso] = useState(0);
  const [estadoDni, setEstadoDni] = useState<EstadoDni>("idle");
  const [avisoDni, setAvisoDni] = useState("");
  const [afiliado, setAfiliado] = useState<boolean | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState("");
  const [listo, setListo] = useState(false);

  const set = <K extends keyof Registro>(k: K, v: Registro[K]) => {
    setF((prev) => ({ ...prev, [k]: v }));
    setErrores((prev) => ({ ...prev, [k]: undefined }));
  };

  const distritos = f.provincia ? PROVINCIAS[f.provincia] : [];

  const revisar = () => {
    const e = validar(f);
    if (estadoDni === "idle" && !e.dni) e.dni = "Valida tu DNI primero.";
    return e;
  };

  // Muestra los errores y lleva al primer campo con problema (y a su paso en celular).
  const mostrar = (e: Errores) => {
    setErrores(e);
    const primero = Object.keys(e)[0] as keyof Registro | undefined;
    if (!primero) return false;
    setPaso(pasoDe(primero));
    requestAnimationFrame(() =>
      document.getElementById(`campo-${primero}`)?.focus(),
    );
    return true;
  };

  const siguiente = () => {
    const e = revisar();
    const delPaso = Object.fromEntries(
      Object.entries(e).filter(([k]) =>
        PASOS[paso].campos.includes(k as keyof Registro),
      ),
    ) as Errores;
    if (!mostrar(delPaso)) setPaso((p) => Math.min(p + 1, PASOS.length - 1));
  };

  const validarDni = async () => {
    if (!esDni(f.dni)) {
      setErrores((prev) => ({ ...prev, dni: "El DNI debe tener 8 dígitos." }));
      return;
    }
    setEstadoDni("cargando");
    setAvisoDni("");
    const res = await fetch(`/api/dni?numero=${f.dni}`).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (res?.ok && data.nombre) {
      set("nombre", data.nombre);
      setAfiliado(data.afiliado ?? null);
      setEstadoDni("ok");
    } else if (res?.status === 404) {
      setEstadoDni("idle");
      setErrores((prev) => ({
        ...prev,
        dni: "No encontramos ese DNI. Revísalo.",
      }));
    } else {
      setEstadoDni("manual");
      setAvisoDni("No pudimos validarlo. Escribe tu nombre completo.");
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorEnvio("");
    if (mostrar(revisar())) return;
    setEnviando(true);
    const res = await fetch("/api/personeros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    }).catch(() => null);
    setEnviando(false);
    if (res?.ok) return setListo(true);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (data.errores) mostrar(data.errores);
    setErrorEnvio(
      data.error ?? "No pudimos enviar tu registro. Inténtalo de nuevo.",
    );
  };

  if (listo) {
    return (
      <div className="fl-done">
        <span className="fl-done-dot" aria-hidden />
        <h2 className="fl-big">¡Ya eres parte de la causa!</h2>
        <p>
          Gracias, {f.nombre.split(" ")[0]}. Quedaste registrado como personero
          de mesa en {f.distrito}, {f.provincia}. Te contactaremos al{" "}
          {f.telefono} para coordinar.
        </p>
        <Link className="fl-cta" href="/">
          Volver al inicio
          <Flecha />
        </Link>
      </div>
    );
  }

  const err = (k: keyof Registro) =>
    errores[k] ? <em className="fl-error">{errores[k]}</em> : null;
  const ultimo = paso === PASOS.length - 1;

  return (
    <form className="fl" data-step={paso} onSubmit={onSubmit} noValidate>
      {/* Progreso (solo celular/tablet) */}
      <div className="fl-progress" aria-hidden>
        {PASOS.map((p, i) => (
          <span key={p.titulo} className={i <= paso ? "is-on" : ""} />
        ))}
      </div>

      <Paso i={0}>
        <div className="fl-field">
          <label htmlFor="campo-dni">DNI</label>
          <div className="fl-row">
            <input
              id="campo-dni"
              inputMode="numeric"
              maxLength={8}
              placeholder="8 dígitos"
              value={f.dni}
              aria-invalid={!!errores.dni}
              onChange={(e) => {
                set("dni", e.target.value.replace(/\D/g, ""));
                set("nombre", "");
                setEstadoDni("idle");
                setAfiliado(null);
                setAvisoDni("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  validarDni();
                }
              }}
            />
            <button
              type="button"
              className={`fl-link ${estadoDni === "ok" ? "is-ok" : ""}`}
              onClick={validarDni}
              disabled={estadoDni === "cargando"}
            >
              {estadoDni === "cargando"
                ? "Validando…"
                : estadoDni === "ok"
                  ? "Validado"
                  : "Validar"}
              <Flecha />
            </button>
          </div>
          {err("dni")}
          {avisoDni && <em className="fl-hint">{avisoDni}</em>}
        </div>

        <div className="fl-field">
          <label htmlFor="campo-nombre">Nombre completo</label>
          <input
            id="campo-nombre"
            placeholder={
              estadoDni === "manual"
                ? "Nombres y apellidos"
                : "Se llenará al validar tu DNI"
            }
            value={f.nombre}
            readOnly={estadoDni !== "manual"}
            aria-invalid={!!errores.nombre}
            onChange={(e) => set("nombre", e.target.value)}
          />
          {err("nombre")}
        </div>

        <div className="fl-grid">
          <div className="fl-field">
            <label htmlFor="campo-telefono">Celular</label>
            <input
              id="campo-telefono"
              type="tel"
              inputMode="numeric"
              maxLength={9}
              placeholder="987654321"
              value={f.telefono}
              aria-invalid={!!errores.telefono}
              onChange={(e) =>
                set("telefono", e.target.value.replace(/\D/g, ""))
              }
            />
            {err("telefono")}
          </div>
          <div className="fl-field">
            <label htmlFor="campo-correo">
              Correo <span className="fl-optional">opcional</span>
            </label>
            <input
              id="campo-correo"
              type="email"
              placeholder="tu@correo.com"
              value={f.correo}
              aria-invalid={!!errores.correo}
              onChange={(e) => set("correo", e.target.value.trim())}
            />
            {err("correo")}
          </div>
        </div>
      </Paso>

      <Paso i={1}>
        <p className="fl-note">
          Elige el distrito de <strong>San Martín</strong> donde cuidarás el
          voto.
        </p>
        <div className="fl-field">
          <label htmlFor="campo-provincia">Provincia</label>
          <select
            id="campo-provincia"
            value={f.provincia}
            aria-invalid={!!errores.provincia}
            onChange={(e) => {
              setF((prev) => ({
                ...prev,
                provincia: e.target.value,
                distrito: "",
              }));
              setErrores((prev) => ({
                ...prev,
                provincia: undefined,
                distrito: undefined,
              }));
            }}
          >
            <option value="">Selecciona</option>
            {Object.keys(PROVINCIAS).map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          {err("provincia")}
        </div>
        <div className="fl-field">
          <label htmlFor="campo-distrito">Distrito</label>
          <select
            id="campo-distrito"
            value={f.distrito}
            disabled={!f.provincia}
            aria-invalid={!!errores.distrito}
            onChange={(e) => set("distrito", e.target.value)}
          >
            <option value="">
              {f.provincia ? "Selecciona" : "Primero la provincia"}
            </option>
            {distritos.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          {err("distrito")}
        </div>
      </Paso>

      <Paso i={2}>
        <div className="fl-status">
          <span>Estado en padrón</span>
          {afiliado === true ? (
            <span className="fl-badge is-yes">Afiliado</span>
          ) : afiliado === false ? (
            <span className="fl-badge is-no">No afiliado</span>
          ) : (
            <span className="fl-badge">Por verificar</span>
          )}
        </div>

        <label className="fl-check">
          <input
            id="campo-experiencia"
            type="checkbox"
            checked={f.experiencia}
            onChange={(e) => set("experiencia", e.target.checked)}
          />
          ¿Tienes experiencia previa como personero?
        </label>

        {f.experiencia && (
          <div className="fl-field">
            <label htmlFor="campo-detalleExperiencia">
              Cuéntanos tu experiencia
            </label>
            <input
              id="campo-detalleExperiencia"
              placeholder="Ej: personero en 2022, mesa de Tarapoto"
              value={f.detalleExperiencia}
              aria-invalid={!!errores.detalleExperiencia}
              onChange={(e) => set("detalleExperiencia", e.target.value)}
            />
            {err("detalleExperiencia")}
          </div>
        )}

        <label className="fl-check fl-consent">
          <input
            id="campo-acepta"
            type="checkbox"
            checked={f.acepta}
            onChange={(e) => set("acepta", e.target.checked)}
          />
          Autorizo el uso de mis datos para coordinar mi participación como
          personero (Ley N.º 29733 de Protección de Datos Personales).
        </label>
        {err("acepta")}
      </Paso>

      <div className="fl-end">
        {errorEnvio && <p className="fl-alert">{errorEnvio}</p>}

        {/* Celular/tablet: navegación entre pasos */}
        <div className="fl-nav">
          {paso > 0 && (
            <button
              type="button"
              className="fl-link fl-back"
              onClick={() => setPaso((p) => p - 1)}
            >
              <Flecha atras />
              Anterior
            </button>
          )}
          {!ultimo && (
            <button
              type="button"
              className="fl-cta fl-next"
              onClick={siguiente}
            >
              Siguiente
              <Flecha />
            </button>
          )}
        </div>

        <button
          type="submit"
          className={`fl-cta fl-submit ${ultimo ? "is-last" : ""}`}
          disabled={enviando}
        >
          {enviando ? "Registrando…" : "Registrar personero"}
          <Flecha />
        </button>
      </div>
    </form>
  );
}
