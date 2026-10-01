// Figura central (anillo, círculo con fotos, retrato de Landa, naranjita y nombre) en su
// lienzo de 1200 x 866. Se usa en la portada y en la página de registro.
import type { CSSProperties } from "react";
import { campaign, circlePhotos } from "../data";
import LandaFigure from "./LandaFigure";

const W = 1200;
const H = 866;
const px = (x: number) => `${(x / W) * 100}%`;
const py = (y: number) => `${(y / H) * 100}%`;
const photoVar = (src?: string) =>
  ({ "--img": src ? `url(${src})` : "none" }) as CSSProperties;

export default function Bust() {
  return (
    <>
      {/* Anillo de rayas */}
      <svg className="layer halo" viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <defs>
          <pattern
            id="ringStripes"
            width="8"
            height="7"
            patternUnits="userSpaceOnUse"
          >
            <rect width="8" height="3.2" fill="var(--line)" />
          </pattern>
        </defs>
        <circle
          cx="571"
          cy="300"
          r="306"
          fill="none"
          stroke="url(#ringStripes)"
          strokeWidth="24"
        />
      </svg>

      {/* Disco: arriba gris carbón con fotos, abajo franjas naranjas */}
      <div
        className="disk parallax"
        style={
          {
            left: px(281),
            top: py(10),
            width: px(580),
            height: py(580),
            "--depth": "-6px",
          } as CSSProperties
        }
      >
        <div className="disk-grid">
          {circlePhotos.map(({ src, pos }, i) => (
            <div
              key={src}
              className={`photo tint-brand p${i + 1}`}
              style={{ ...photoVar(src), backgroundPosition: pos }}
            />
          ))}
        </div>
        <svg
          className="disk-stripes"
          viewBox="0 0 580 580"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M0 322 C150 296 400 296 580 312 L580 580 L0 580 Z"
            fill="var(--bg)"
          />
          <path
            d="M0 370 C180 346 400 340 580 354 L580 378 C400 364 180 372 0 396 Z"
            fill="var(--brand)"
          />
          <path
            d="M0 420 C200 392 420 386 580 400 L580 438 C420 424 200 432 0 464 Z"
            fill="var(--brand)"
          />
        </svg>
      </div>

      {/* Retrato vectorial */}
      <div
        className="portrait parallax"
        style={{ "--depth": "10px" } as CSSProperties}
      >
        <LandaFigure name={campaign.name} />
        {/* Naranjita que rebota sobre el pecho del polo */}
        <div
          className="orange-wrap"
          style={{ left: px(575), top: py(832) }}
          aria-hidden
        >
          <span className="orange-shadow" />
          <span className="orange" />
        </div>
      </div>

      <div className="name-tag" style={{ left: px(714), top: py(546) }}>
        <strong>{campaign.name}</strong>
        <span>{campaign.years}</span>
      </div>
    </>
  );
}
