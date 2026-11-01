import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NikahKu — Wedding Planner",
  description: "Siapkan pernikahan dengan checklist, budget, dokumen & tamu dalam satu tempat.",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport = { themeColor: "#e11d48" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
