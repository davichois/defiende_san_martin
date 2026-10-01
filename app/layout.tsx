import type { Metadata } from "next";
import { Josefin_Sans, Raleway } from "next/font/google";
import "./globals.css";

const display = Josefin_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const text = Raleway({
  variable: "--font-text",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const TITULO = "Defiende San Martín · David Landa Tucto";
const DESCRIPCION =
  "David Landa Tucto, candidato de Fuerza Popular al Gobierno Regional de San Martín. Conoce sus 10 propuestas, súmate como personero y defiende el voto este 4 de octubre.";

export const metadata: Metadata = {
  // Las páginas internas se muestran como "Título · David Landa"
  title: { default: TITULO, template: "%s · David Landa" },
  description: DESCRIPCION,
  applicationName: "Defiende San Martín",
  authors: [{ name: "David Landa Tucto" }],
  keywords: [
    "David Landa",
    "David Landa Tucto",
    "Defiende San Martín",
    "San Martín",
    "Fuerza Popular",
    "Gobierno Regional de San Martín",
    "Elecciones Regionales 2026",
    "personeros",
    "Moyobamba",
    "Tarapoto",
  ],
  openGraph: {
    type: "website",
    locale: "es_PE",
    siteName: "Defiende San Martín",
    title: TITULO,
    description: DESCRIPCION,
  },
  twitter: {
    card: "summary",
    title: TITULO,
    description: DESCRIPCION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${display.variable} ${text.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
