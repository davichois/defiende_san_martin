import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Link from "next/link";
import RegistroForm from "./RegistroForm";
import "./unirse.css";

// Montserrat para etiquetas, campos y textos; Josefin Sans (de la portada) para títulos y botones.
const montserrat = Montserrat({
  variable: "--font-mont",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sé personero · Defiende el voto en San Martín",
  description:
    "Inscríbete como personero de mesa de David Landa Tucto y Fuerza Popular. Defiende el voto en tu distrito de San Martín este 4 de octubre.",
  openGraph: {
    title: "Sé personero · Defiende el voto en San Martín",
    description:
      "Inscríbete como personero de mesa de David Landa Tucto y Fuerza Popular. Defiende el voto en tu distrito de San Martín.",
  },
};

export default function UnirsePage() {
  return (
    <main className={`reg-page ${montserrat.variable}`}>
      <Link className="reg-back" href="/">
        <svg viewBox="0 0 16 16" aria-hidden>
          <path
            d="M13 8H4M7.5 4.5 4 8l3.5 3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Volver
      </Link>

      {/* Mensaje fijo arriba a la derecha: no ocupa espacio, así el formulario no se mueve */}
      <div className="reg-claim">
        <span className="reg-claim-kicker">Únete como personero</span>
        <strong>
          Defendamos el voto
          <span className="reg-claim-place">
            {" "}
            en <em>San Martín</em>
          </span>
        </strong>
      </div>

      <RegistroForm />
    </main>
  );
}
