const rp = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export const rupiah = (n: number | null | undefined) => rp.format(Number(n ?? 0));

export function formatDate(d: string | null | undefined) {
  if (!d) return "-";
  return new Date(d + "T00:00:00").toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** "Rp 50.000.000" / "50.000.000" → 50000000 */
export function parseNumber(v: FormDataEntryValue | null) {
  const n = Number(String(v ?? "").replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function daysUntil(d: string) {
  const target = new Date(d + "T00:00:00").getTime();
  const now = new Date(todayISO() + "T00:00:00").getTime();
  return Math.round((target - now) / 86_400_000);
}
