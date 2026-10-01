"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

// Acceso oculto de administración: tres toques seguidos sobre el bigote abren un cuadro que pide
// la contraseña; el servidor la valida, consulta Supabase y devuelve el Excel de personeros.

const VENTANA_TOQUES_MS = 700;

export default function AdminExport() {
  const toques = useRef<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [abierto, setAbierto] = useState(false);
  const [password, setPassword] = useState("");
  const [estado, setEstado] = useState<"idle" | "cargando" | "ok">("idle");
  const [mensaje, setMensaje] = useState("");

  const cerrar = () => {
    setAbierto(false);
    setPassword("");
    setMensaje("");
    setEstado("idle");
  };

  useEffect(() => {
    if (!abierto) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && cerrar();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierto]);

  const tocar = () => {
    const ahora = performance.now();
    toques.current = [...toques.current, ahora].filter(
      (t) => ahora - t < VENTANA_TOQUES_MS * 2,
    );
    if (toques.current.length >= 3) {
      toques.current = [];
      setAbierto(true);
    }
  };

  const descargar = async (e: FormEvent) => {
    e.preventDefault();
    setEstado("cargando");
    setMensaje("");
    const res = await fetch("/api/personeros/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).catch(() => null);

    if (!res?.ok) {
      const data = res ? await res.json().catch(() => ({})) : {};
      setEstado("idle");
      setMensaje(data.error ?? "No se pudo descargar. Revisa tu conexión.");
      setPassword("");
      inputRef.current?.focus();
      return;
    }

    const total = res.headers.get("X-Total-Personeros") ?? "0";
    const nombre =
      res.headers
        .get("Content-Disposition")
        ?.match(/filename="([^"]+)"/)?.[1] ?? "personeros.xlsx";
    const url = URL.createObjectURL(await res.blob());
    const a = document.createElement("a");
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setEstado("ok");
    setMensaje(
      `Descargado: ${total} personero${total === "1" ? "" : "s"} registrados.`,
    );
  };

  // Evita que el toque cambie de historia en celular.
  const aislar = {
    onPointerDown: (e: React.PointerEvent) => e.stopPropagation(),
    onPointerUp: (e: React.PointerEvent) => e.stopPropagation(),
  };

  return (
    <>
      <button
        type="button"
        className="stache-hit"
        onClick={tocar}
        aria-hidden
        tabIndex={-1}
        {...aislar}
      />

      {abierto && (
        <div className="admin-backdrop" onClick={cerrar} {...aislar}>
          <form
            className="admin-box"
            onSubmit={descargar}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Descargar personeros"
          >
            <span className="admin-kicker">Acceso administrador</span>
            <h2>Personeros registrados</h2>
            <label htmlFor="admin-pass">Contraseña</label>
            <input
              ref={inputRef}
              id="admin-pass"
              type="password"
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {mensaje && (
              <p className={estado === "ok" ? "admin-ok" : "admin-error"}>
                {mensaje}
              </p>
            )}
            <div className="admin-actions">
              <button type="button" className="admin-cancel" onClick={cerrar}>
                Cerrar
              </button>
              <button
                type="submit"
                className="admin-go"
                disabled={!password || estado === "cargando"}
              >
                {estado === "cargando" ? "Generando…" : "Descargar Excel"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
