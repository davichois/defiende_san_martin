"use client";

import { useEffect, useRef, useState } from "react";

// Música de fondo en bucle con un botón redondo de play/pausa sobre el hombro derecho.
// Suena apenas se entra; si el navegador bloquea el sonido sin interacción previa (regla de los
// navegadores), arranca con el primer toque, clic o tecla.

const SRC = "/subesubelanda.mp4";
// Gestos que los navegadores aceptan para habilitar el sonido (touchend/click para iPhone).
const GESTOS = ["pointerdown", "touchend", "click", "keydown"];

export default function Music() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const botonRef = useRef<HTMLButtonElement>(null);
  const [sonando, setSonando] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.6;

    const quitar = () => {
      for (const ev of GESTOS)
        window.removeEventListener(ev, alInteractuar, true);
    };
    function alInteractuar(e: Event) {
      // El botón de música maneja su propio clic.
      if (botonRef.current?.contains(e.target as Node)) return quitar();
      audio!.play().catch(() => {});
      quitar();
    }

    audio.play().catch(() => {
      for (const ev of GESTOS) window.addEventListener(ev, alInteractuar, true);
    });
    return quitar;
  }, []);

  const alternar = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={SRC}
        loop
        preload="auto"
        onPlay={() => setSonando(true)}
        onPause={() => setSonando(false)}
      />
      <button
        ref={botonRef}
        type="button"
        className={`music ${sonando ? "is-on" : ""}`}
        onClick={alternar}
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
        aria-pressed={sonando}
        aria-label={sonando ? "Pausar música" : "Reproducir música"}
        title={sonando ? "Pausar música" : "Reproducir música"}
      >
        <span className="music-icon" aria-hidden>
          {sonando ? (
            <svg viewBox="0 0 16 16">
              <rect x="3.5" y="3" width="3" height="10" rx="1" />
              <rect x="9.5" y="3" width="3" height="10" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16">
              <path d="M5 3.2v9.6a.6.6 0 0 0 .9.5l7.4-4.8a.6.6 0 0 0 0-1L5.9 2.7a.6.6 0 0 0-.9.5z" />
            </svg>
          )}
        </span>
      </button>
    </>
  );
}
