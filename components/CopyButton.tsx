"use client";

import { useState } from "react";

export default function CopyButton({ text, label = "Salin" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="rounded border border-stone-300 bg-white px-2 py-1 text-xs hover:bg-stone-50"
    >
      {copied ? "Tersalin ✓" : label}
    </button>
  );
}
