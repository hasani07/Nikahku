"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Progress bar di atas layar:
 * - muncul saat klik link internal → hilang saat halaman baru tampil
 * - muncul saat submit form (simpan data) + label "Menyimpan…" → hilang saat konten ter-update
 */
export default function NavProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = useState<"idle" | "nav" | "save">("idle");
  const timer = useRef<number | undefined>(undefined);
  const observer = useRef<MutationObserver | null>(null);

  const done = () => {
    observer.current?.disconnect();
    window.clearTimeout(timer.current);
    setState("idle");
  };

  useEffect(done, [pathname, searchParams]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname.endsWith("/export")) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      setState("nav");
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(done, 15000);
    };

    const onSubmit = (e: SubmitEvent) => {
      const form = e.target as HTMLFormElement;
      // Server Action React → atribut action berisi "javascript:…"; selain itu = form GET biasa (mis. pencarian)
      const isGet = !(form.getAttribute("action") ?? "").startsWith("javascript:");
      setState(isGet ? "nav" : "save");
      observer.current?.disconnect();
      window.clearTimeout(timer.current);
      const target = document.querySelector("main") ?? document.body;
      // tunggu sebentar, lalu anggap selesai ketika konten berubah (data tersimpan & dirender ulang)
      window.setTimeout(() => {
        observer.current = new MutationObserver(() => window.setTimeout(done, 150));
        observer.current.observe(target, { childList: true, subtree: true, characterData: true });
      }, 80);
      timer.current = window.setTimeout(done, 15000);
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
      observer.current?.disconnect();
      window.clearTimeout(timer.current);
    };
  }, []);

  if (state === "idle") return null;

  return (
    <>
      <div className="no-print pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] overflow-hidden">
        <div className="progress-bar h-full bg-gradient-to-r from-rose-400 via-rose-500 to-amber-400 shadow-[0_0_8px_rgba(244,63,94,0.7)]" />
      </div>
      {state === "save" && (
        <div className="no-print pointer-events-none fixed left-1/2 top-3 z-[60] -translate-x-1/2 md:top-auto md:bottom-6">
          <div className="toast-in flex items-center gap-2 rounded-full bg-stone-900/90 px-4 py-2 text-xs text-white shadow-lg">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Menyimpan…
          </div>
        </div>
      )}
    </>
  );
}
