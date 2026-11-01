import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import NavProgress from "@/components/NavProgress";
import "./globals.css";

export const metadata: Metadata = {
  title: "NikahKu — Wedding Planner",
  description: "Siapkan pernikahan dengan checklist, budget, dokumen & tamu dalam satu tempat.",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  appleWebApp: { capable: true, title: "NikahKu", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#e11d48",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen antialiased">
        <Suspense fallback={null}>
          <NavProgress />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
