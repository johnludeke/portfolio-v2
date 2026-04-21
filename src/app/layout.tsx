import type { Metadata } from "next";
import { Dancing_Script, Source_Code_Pro } from "next/font/google";
import "./globals.css";
import CursorTrail from "@/components/ui/CursorTrail";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing-script",
  display: "swap",
});

const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-source-code-pro",
  display: "swap",
});

export const metadata: Metadata = {
  title: "John Ludeke",
  description:
    "Software engineer portfolio featuring projects, experience, and blog.",
  openGraph: {
    title: "John Ludeke",
    description:
      "Software engineer portfolio featuring projects, experience, and blog.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dancingScript.variable} ${sourceCodePro.variable}`}
    >
      <body>
        <CursorTrail />
        {children}
      </body>
    </html>
  );
}
