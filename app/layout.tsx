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

export const metadata: Metadata = {
  title: "David Landa · Únete a la causa",
  description: "Súmate como personero y cuida el voto.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${display.variable} ${text.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
