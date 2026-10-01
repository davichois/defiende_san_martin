"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { annotations, campaign, proposals, type Point } from "../data";
import Link from "next/link";
import Countdown from "./Countdown";
import Social from "./Social";
import Music from "./Music";
import Bust from "./Bust";
import AdminExport from "./AdminExport";

// Lienzo base de la figura central (círculo + busto).
const W = 1200;
const H = 866;
const py = (y: number) => `${(y / H) * 100}%`;
// Cuánto se abren como máximo los textos hacia los costados en pantallas anchas.
const MAX_SPREAD = 180;
// Alto visible: 866 + 22 de margen para que el anillo, que sobresale arriba, se vea completo.
const VISIBLE_H = 888;
// Margen lateral mínimo (en unidades) para que los textos no toquen los bordes.
const SIDE_PAD = 40;
// Duración de cada historia en celular (ms).
const STORY_MS = 6000;
// Celular vertical: franja superior de barritas + botón (px), cuánto se mete el polo bajo la
// tarjeta (px) y ancho mínimo visible del lienzo (unidades) para que la cara nunca se recorte.
const TOP_UI = 80;
const CARD_OVERLAP = 70;
const MIN_VISIBLE_W = 540;
// Tablet vertical: distancia (px) desde arriba a la fila de grupos.
const TALL_ROW_PX = 84;
// Celular horizontal: fracción del ancho para la figura (la tarjeta va a la derecha).
const SIDE_FIG = 0.52;

const pad = (n: number) => String(n).padStart(2, "0");
// Alto (unidades) de la cabecera de "¿Quién soy?" cerrada: su borde inferior queda fijo al abrir.
const BIO_H = 105;

// Historias del celular: cada propuesta por separado (resalta el punto de su grupo) y al final las
// anotaciones que no son grupos.
const stories = [
  ...proposals.map((p) => ({
    id: `p${p.n}`,
    n: p.n,
    title: p.title,
    body: p.body,
    group: annotations.find((a) => a.items?.includes(p.n))?.id ?? "",
  })),
  ...annotations
    .filter((a) => !a.items)
    .map((a) => ({
      id: a.id,
      n: 0,
      title: a.title,
      body: a.body,
      group: a.id,
    })),
];

export default function Infographic() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  // Celular (vertical de menos de 700 px o horizontal de menos de 500 px de alto): modo historias.
  // Tablets y computadoras usan la vista de escritorio.
  const [portrait, setPortrait] = useState(false);
  const [story, setStory] = useState(0);
  const [paused, setPaused] = useState(false);
  const storyRef = useRef<HTMLElement>(null);
  const [storyH, setStoryH] = useState(0);
  const press = useRef<{ x: number; y: number; t: number } | null>(null);
  // Grupos de propuestas abiertos
  const [open, setOpen] = useState<Set<string>>(new Set());

  useEffect(() => {
    const mq = window.matchMedia(
      "(orientation: portrait) and (max-width: 699px), (orientation: landscape) and (max-height: 500px)",
    );
    const sync = () => setPortrait(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // La barrita activa es el temporizador: al terminar su animación pasa a la siguiente historia.
  // Mantener presionado la pausa; deslizar o tocar a los lados cambia de historia.
  const go = (d: number) =>
    setStory((i) => (i + d + stories.length) % stories.length);
  const onPressStart = (e: React.PointerEvent) => {
    if (!portrait) return;
    press.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    setPaused(true);
  };
  const onPressEnd = (e: React.PointerEvent) => {
    const p = press.current;
    press.current = null;
    setPaused(false);
    if (!portrait || !p) return;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy))
      return go(dx < 0 ? 1 : -1);
    if (performance.now() - p.t < 250 && Math.hypot(dx, dy) < 10)
      go(e.clientX < window.innerWidth * 0.3 ? -1 : 1);
  };
  const onPressCancel = () => {
    press.current = null;
    setPaused(false);
  };
  const pressHandlers = {
    onPointerDown: onPressStart,
    onPointerUp: onPressEnd,
    onPointerCancel: onPressCancel,
    onPointerLeave: onPressCancel,
  };

  useEffect(() => {
    const el = storyRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setStoryH(entry.borderBoxSize[0].blockSize);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setBox({ w: width, h: height });
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  // Horizontal: todo entra sin recortes, apoyado abajo y con margen a los lados; el ancho que
  // sobre abre un poco los textos. Vertical (historias): la figura llena el alto entre las
  // barritas y la tarjeta, y puede salirse por los costados.
  // Alta (tablet vertical): la fila de grupos va sobre el círculo y se recortan los costados.
  // Celular horizontal: historias con la figura a la izquierda y la tarjeta a la derecha.
  const tall = !portrait && box.h > box.w * 1.05;
  const toggle = (id: string) =>
    setOpen((prev) => {
      // En pantallas altas las listas se abren como panel: una a la vez.
      const next = new Set(tall ? [...prev].filter((k) => k === id) : prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const side = portrait && box.w > box.h;
  const landscape = !portrait && !tall && box.h > 0;
  const scale = landscape
    ? Math.min(box.w / (W + 2 * SIDE_PAD), box.h / VISIBLE_H)
    : 0;
  const extra = landscape ? Math.max(0, Math.round(box.w / scale - W)) : 0;
  let stageBox: CSSProperties = landscape
    ? { width: box.w, left: 0, top: box.h - H * scale, translate: "none" }
    : {};
  let tallDy = 0;
  let cdTop: number | null = null;
  if (tall) {
    // Lo más grande posible dejando ~135 px a cada lado del anillo (contador) y espacio arriba
    // para la fila de grupos, que ocupa 900 unidades de ancho y también tiene que caber.
    const s = Math.min(
      (box.w - 2 * 135) / 636,
      (box.w - 40) / 900,
      (box.h - TALL_ROW_PX - 250) / VISIBLE_H,
    );
    stageBox = {
      width: W * s,
      left: (box.w - W * s) / 2,
      top: box.h - H * s,
      translate: "none",
    };
    // Sube la fila de grupos hasta justo debajo de "Unirse" (los brazos se alargan) y deja el
    // contador a la altura del centro del círculo.
    tallDy = Math.min(0, -(box.h - H * s - TALL_ROW_PX) / s + 235);
    cdTop = box.h - H * s + 300 * s;
  } else if (side && box.h > 0) {
    const area = box.w * SIDE_FIG;
    const s = Math.min((box.h - 50) / VISIBLE_H, area / 680);
    stageBox = {
      width: W * s,
      left: (area - W * s) / 2,
      top: box.h - H * s,
      translate: "none",
    };
  } else if (portrait && box.h > 0 && storyH > 0) {
    const bottom = box.h - storyH + CARD_OVERLAP;
    const s = Math.min((bottom - TOP_UI) / VISIBLE_H, box.w / MIN_VISIBLE_W);
    stageBox = {
      width: W * s,
      left: (box.w - W * s) / 2,
      top: bottom - H * s,
      translate: "none",
    };
  }

  const total = W + extra;
  const off = extra / 2;
  const spread = Math.max(0, Math.min(off * 0.5, MAX_SPREAD, off - SIDE_PAD));
  const sx = (x: number) => `${(x / total) * 100}%`;
  const placed = annotations.map((a) => {
    if (tall && a.tall) {
      const l = a.tall.line.map(([x, y], i): Point => [
        x,
        i < 2 ? y + tallDy : y,
      ]);
      return {
        a: {
          ...a,
          y: a.tall.y + tallDy,
          width: a.tall.width,
          align: "left" as const,
        },
        x: a.tall.x,
        line: l,
        end: l[l.length - 1],
      };
    }
    const end = a.line[a.line.length - 1];
    const dir = a.spread === false ? 0 : a.x + a.width / 2 < end[0] ? -1 : 1;
    const shift = off + dir * spread;
    // El texto y su subrayado se desplazan; el punto señalado queda pegado a la figura.
    const line = a.line.map(([x, y], i): Point => [
      x + (i === a.line.length - 1 ? off : shift),
      y,
    ]);
    return { a, x: a.x + shift, line, end: line[line.length - 1] };
  });

  const current = stories[story];
  const active = portrait ? current.group : hovered;

  const onMove = (e: React.MouseEvent) => {
    const el = stageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty(
      "--mx",
      String(((e.clientX - r.left) / r.width) * 2 - 1),
    );
    el.style.setProperty(
      "--my",
      String(((e.clientY - r.top) / r.height) * 2 - 1),
    );
  };
  const onLeave = () => {
    stageRef.current?.style.setProperty("--mx", "0");
    stageRef.current?.style.setProperty("--my", "0");
    setHovered(null);
  };

  return (
    <>
      {/* Barritas de progreso de las historias (solo celular vertical) */}
      <div className="story-bars" aria-hidden>
        {stories.map((a, i) => (
          <span key={a.id} className={i < story ? "done" : ""}>
            {i === story && (
              <i
                key={story}
                className={paused ? "paused" : ""}
                style={{ animationDuration: `${STORY_MS}ms` }}
                onAnimationEnd={() => go(1)}
              />
            )}
          </span>
        ))}
      </div>

      <div
        className="cd-slot"
        style={
          cdTop !== null
            ? ({ "--cd-top": `${cdTop}px` } as CSSProperties)
            : undefined
        }
      >
        <Countdown />
      </div>
      {/* En escritorio la lista de Turismo abierta llega a la esquina: ahí se ocultan las redes */}
      <Social hidden={!portrait && open.has("turismo")} />

      <header className="topbar">
        <Link className="cta" href={campaign.cta.href}>
          <span>{campaign.cta.label}</span>
          <span className="cta-icon" aria-hidden>
            <svg viewBox="0 0 16 16" width="14" height="14">
              <path
                d="M3 8h9M8.5 4.5 12 8l-3.5 3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </Link>
      </header>

      <div className="stage-wrap" ref={wrapRef} {...pressHandlers}>
        <div
          ref={stageRef}
          className={`stage ${active ? "has-hover" : ""} ${portrait ? "is-story" : ""} ${side ? "is-side" : ""} ${tall ? "is-tall" : ""}`}
          style={{ "--wt": total, ...stageBox } as CSSProperties}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
        >
          {/* Figura central: siempre en su lienzo de 1200 x 866, centrada */}
          <div className="composition" style={{ left: sx(off), width: sx(W) }}>
            <Bust />
            {/* Música: dentro del círculo, arriba al centro sobre las fotos */}
            <Music />
            {/* Acceso oculto: tres toques en el bigote descargan el Excel (con contraseña) */}
            <AdminExport />
          </div>

          {/* Líneas guía */}
          <svg
            className="layer lines"
            viewBox={`0 0 ${total} ${H}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            {placed.map(({ a, line, end }, i) => (
              <g
                key={a.id}
                className={`${a.compact ? "compact" : ""} ${active === a.id ? "is-active" : ""}`}
              >
                <polyline
                  points={line.map((p) => p.join(",")).join(" ")}
                  pathLength={1}
                  style={{ animationDelay: `${0.5 + i * 0.12}s` }}
                />
                <circle className="pulse" cx={end[0]} cy={end[1]} r="7" />
                <circle className="dot" cx={end[0]} cy={end[1]} r="4" />
              </g>
            ))}
          </svg>

          {/* Textos (pantallas grandes) y puntos numerados (pantallas chicas) */}
          {placed.map(({ a, x, end }, i) => (
            <div key={a.id}>
              <div
                className={`anno ${a.align} ${a.compact ? "compact" : ""} ${tall && x > 500 ? "tall-r" : ""} ${a.more ? "bio" : ""} ${active === a.id ? "is-active" : ""}`}
                style={{
                  left: sx(x),
                  ...(a.more
                    ? { bottom: `${(1 - (a.y + BIO_H) / H) * 100}%` }
                    : { top: py(a.y) }),
                  width: sx(a.width),
                  animationDelay: `${0.8 + i * 0.12}s`,
                }}
                onMouseEnter={() => setHovered(a.id)}
              >
                {a.items ? (
                  <>
                    <button
                      type="button"
                      className="anno-head"
                      aria-expanded={open.has(a.id)}
                      onClick={() => toggle(a.id)}
                    >
                      <span className="anno-pill">
                        {a.items.length} propuestas
                      </span>
                      <span className="anno-title">{a.title}</span>
                      <span className="anno-body">{a.body}</span>
                      <span className="anno-toggle">
                        {open.has(a.id) ? "Ocultar" : "Ver propuestas"}
                        <i aria-hidden>{open.has(a.id) ? "−" : "+"}</i>
                      </span>
                    </button>
                    {open.has(a.id) && (
                      <ol className="anno-list">
                        {a.items.map((n) => (
                          <li key={n}>
                            <span className="anno-n">{pad(n)}</span>
                            <span>
                              <strong>{proposals[n - 1].title}</strong>
                              <em>{proposals[n - 1].body}</em>
                            </span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </>
                ) : a.more ? (
                  <>
                    {/* Se despliega hacia arriba: la lista va antes y el bloque se ancla abajo */}
                    {open.has(a.id) && (
                      <ul className="anno-more">
                        {a.more.map((m) => (
                          <li key={m}>{m}</li>
                        ))}
                      </ul>
                    )}
                    <button
                      type="button"
                      className="anno-head"
                      aria-expanded={open.has(a.id)}
                      onClick={() => toggle(a.id)}
                    >
                      <span className="anno-title">{a.title}</span>
                      <span className="anno-body">{a.body}</span>
                      <span className="anno-toggle">
                        {open.has(a.id) ? "Ver menos" : "Ver más"}
                        <i aria-hidden>{open.has(a.id) ? "−" : "+"}</i>
                      </span>
                    </button>
                  </>
                ) : (
                  <>
                    <span className="anno-title">{a.title}</span>
                    <span className="anno-body">{a.body}</span>
                  </>
                )}
              </div>
              <button
                type="button"
                className={`hotspot ${active === a.id ? "is-active" : ""}`}
                style={{ left: sx(end[0]), top: py(end[1]) }}
                onClick={() => setHovered(a.id)}
                aria-label={a.title}
              >
                {i + 1}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Historias (solo celular vertical): toca o desliza para cambiar, mantén presionado para pausar */}
      <section
        className="story"
        ref={storyRef}
        aria-live="polite"
        {...pressHandlers}
      >
        <div className="story-name">
          <strong>{campaign.name}</strong>
          <span>{campaign.years}</span>
        </div>
        <article key={current.id} className="story-card">
          <span className="story-count">
            {pad(story + 1)}
            <em>/ {pad(stories.length)}</em>
          </span>
          <h2 className="anno-title">{current.title}</h2>
          <p className="anno-body">{current.body}</p>
        </article>
      </section>
    </>
  );
}
