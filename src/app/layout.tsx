import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ParticleBackground } from "@/components/ParticleBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Hub Dashboard",
  description: "A unified dashboard for all AI tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#050505] text-white antialiased`}>
        <ParticleBackground />
        <div className="relative z-10 w-full min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
