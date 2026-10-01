"use client";

import { useEffect, useState } from "react";
import { campaign } from "../data";

const { date, place, label } = campaign.election;
const START = new Date(date).getTime();
// Las mesas cierran a las 4:00 p. m.; ese día se muestra "Hoy se vota" hasta el cierre.
const END = START + 9 * 60 * 60 * 1000;

const pad = (n: number) => String(n).padStart(2, "0");

export default function Countdown() {
  // Solo en el cliente: la hora del servidor no coincide con la del visitante.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  if (now === null || now >= END) return null;

  if (now >= START) {
    return (
      <div className="countdown is-today" role="status">
        <span className="cd-kicker">{place}</span>
        <div className="cd-main">
          <strong>Hoy se vota</strong>
          <i className="cd-live" />
        </div>
        <p className="cd-caption">Mesas abiertas hasta las 4:00 p. m.</p>
      </div>
    );
  }

  const left = Math.floor((START - now) / 1000);
  const days = Math.floor(left / 86400);
  const hours = Math.floor((left % 86400) / 3600);
  const mins = Math.floor((left % 3600) / 60);
  const secs = left % 60;

  return (
    <div
      className="countdown"
      role="timer"
      aria-label={`Faltan ${days} días para las elecciones en ${place}`}
    >
      <span className="cd-kicker">Faltan</span>
      <div className="cd-main">
        <strong>{pad(days)}</strong>
        <span>{days === 1 ? "día" : "días"}</span>
        <i className="cd-live" />
      </div>
      <div className="cd-clock">
        {pad(hours)}
        <small>h</small> {pad(mins)}
        <small>m</small> {pad(secs)}
        <small>s</small>
      </div>
      <p className="cd-caption">
        para votar en {place} · {label}
      </p>
    </div>
  );
}
