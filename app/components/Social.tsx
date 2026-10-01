import { campaign } from "../data";

// Accesos a redes sociales. Solo se muestran las que tienen enlace en `campaign.social`.
const ICONOS = {
  facebook: (
    <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21z" />
  ),
  instagram: (
    <>
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle
        cx="12"
        cy="12"
        r="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="17.3" cy="6.7" r="1.3" />
    </>
  ),
  tiktok: (
    <path d="M16.6 3c.3 2.2 1.6 3.6 3.9 3.8v2.6c-1.4.1-2.6-.3-3.9-1.1v5.4c0 6.9-7.5 9-10.5 4-1.9-3.2-.7-8.9 5.6-9.1v2.8c-.5.1-1 .2-1.4.4-1.4.5-2.2 1.4-2 3 .4 3.1 6 4 5.6-2V3z" />
  ),
} as const;

const NOMBRES = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
};

export default function Social({ hidden = false }: { hidden?: boolean }) {
  const redes = (Object.keys(ICONOS) as (keyof typeof ICONOS)[]).filter(
    (r) => campaign.social[r],
  );
  if (!redes.length) return null;
  return (
    <nav
      className={`social ${hidden ? "is-hidden" : ""}`}
      aria-label="Redes sociales"
      aria-hidden={hidden}
    >
      {redes.map((r) => (
        <a
          key={r}
          href={campaign.social[r]}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${campaign.name} en ${NOMBRES[r]}`}
          title={NOMBRES[r]}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            {ICONOS[r]}
          </svg>
        </a>
      ))}
    </nav>
  );
}
