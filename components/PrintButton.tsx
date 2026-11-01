"use client";

export default function PrintButton({ label = "🖨️ Cetak / PDF" }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="no-print inline-flex items-center rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm hover:bg-stone-50"
    >
      {label}
    </button>
  );
}
