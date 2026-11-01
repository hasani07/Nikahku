import { headers } from "next/headers";

/** Domain aplikasi saat ini (localhost / vercel.app / custom domain). */
export async function getOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Nomor 08xx → link wa.me/628xx, opsional dengan pesan. */
export function waLink(phone: string | null | undefined, text?: string) {
  const digits = (phone ?? "").replace(/\D/g, "").replace(/^0/, "62");
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${digits}${q}`;
}
