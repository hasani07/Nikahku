import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NikahKu — Wedding Planner",
    short_name: "NikahKu",
    description: "Checklist, budget, vendor, tamu & undangan digital untuk persiapan nikah.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#fff8f8",
    theme_color: "#e11d48",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
