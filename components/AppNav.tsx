"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Item = { href: string; icon: string; label: string };

const GROUPS: { title: string; items: Item[] }[] = [
  {
    title: "Utama",
    items: [
      { href: "/dashboard", icon: "🏠", label: "Beranda" },
      { href: "/checklist", icon: "✅", label: "Checklist" },
      { href: "/budget", icon: "💰", label: "Budget" },
      { href: "/savings", icon: "🐷", label: "Tabungan" },
    ],
  },
  {
    title: "Persiapan",
    items: [
      { href: "/vendors", icon: "🤝", label: "Vendor" },
      { href: "/documents", icon: "📄", label: "Dokumen" },
      { href: "/guests", icon: "👥", label: "Tamu" },
      { href: "/invitation", icon: "💌", label: "Undangan" },
    ],
  },
  {
    title: "Hari H",
    items: [
      { href: "/rundown", icon: "🕒", label: "Rundown" },
      { href: "/hari-h", icon: "🎉", label: "Mode Hari H" },
      { href: "/gifts", icon: "🎁", label: "Amplop & Hadiah" },
    ],
  },
  {
    title: "Lainnya",
    items: [
      { href: "/guide", icon: "📖", label: "Panduan" },
      { href: "/settings", icon: "⚙️", label: "Pengaturan" },
    ],
  },
];

const TABS: Item[] = [
  { href: "/dashboard", icon: "🏠", label: "Beranda" },
  { href: "/checklist", icon: "✅", label: "Checklist" },
  { href: "/budget", icon: "💰", label: "Budget" },
  { href: "/guests", icon: "👥", label: "Tamu" },
];

const ALL = GROUPS.flatMap((g) => g.items);

export default function AppNav({
  couple,
  daysLeft,
  signOut,
}: {
  couple: string;
  daysLeft: number;
  signOut: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const current = ALL.find((i) => isActive(i.href));
  const inTabs = TABS.some((t) => isActive(t.href));

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const countdown = daysLeft > 0 ? `${daysLeft} hari lagi` : daysLeft === 0 ? "Hari ini! 🎉" : "Sudah menikah 💕";

  return (
    <>
      {/* ===== Sidebar kaca melayang (desktop) ===== */}
      <aside className="no-print sticky top-0 hidden h-screen w-64 shrink-0 p-3 md:block">
        <div className="glass-strong flex h-full flex-col rounded-[28px]">
          <div className="px-5 pb-4 pt-5">
            <Link href="/dashboard" className="flex items-center gap-2 text-lg font-bold tracking-tight">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_6px_14px_-6px_rgba(225,29,72,0.7)]">💍</span>
              <span className="bg-gradient-to-r from-rose-700 to-fuchsia-600 bg-clip-text text-transparent">NikahKu</span>
            </Link>
            <div className="glass-pill mt-4 rounded-2xl px-3 py-2.5">
              <p className="truncate text-sm font-semibold text-stone-800">{couple}</p>
              <p className="text-xs font-medium text-rose-600">{countdown}</p>
            </div>
          </div>
          <nav className="flex-1 space-y-4 overflow-y-auto px-3 pb-4">
            {GROUPS.map((g) => (
              <div key={g.title}>
                <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-stone-400">{g.title}</p>
                {g.items.map((i) => {
                  const active = isActive(i.href);
                  return (
                    <Link
                      key={i.href}
                      href={i.href}
                      className={`group flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition-all duration-200 ${
                        active
                          ? "bg-white/85 font-semibold text-rose-700 shadow-[inset_0_1px_0_#fff,0_6px_16px_-8px_rgba(136,19,55,0.35)]"
                          : "text-stone-600 hover:bg-white/50 hover:text-stone-900"
                      }`}
                    >
                      <span className={`text-base transition-transform duration-200 group-hover:scale-110 ${active ? "scale-110" : ""}`}>{i.icon}</span>
                      {i.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
          <form action={signOut} className="p-3">
            <button className="w-full rounded-2xl px-3 py-2 text-left text-sm text-stone-500 transition hover:bg-white/50">↩︎ Keluar</button>
          </form>
        </div>
      </aside>

      {/* ===== Header kaca (mobile) ===== */}
      <header className="no-print sticky top-0 z-30 px-3 pt-[calc(env(safe-area-inset-top)+0.5rem)] md:hidden">
        <div className="glass-strong flex items-center gap-3 rounded-[22px] px-4 py-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-lg shadow-[inset_0_1px_0_#fff]">
            {current?.icon ?? "💍"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold leading-tight">{current?.label ?? "NikahKu"}</p>
            <p className="truncate text-xs text-stone-500">{couple} · <span className="font-medium text-rose-600">{countdown}</span></p>
          </div>
        </div>
      </header>

      {/* ===== Tab bar kaca melayang (mobile) ===== */}
      <nav className="no-print fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.6rem)] z-40 md:hidden">
        <div className="glass-strong grid grid-cols-5 rounded-[26px] p-1.5">
          {TABS.map((t) => {
            const active = isActive(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`flex flex-col items-center gap-0.5 rounded-[20px] py-1.5 text-[10.5px] transition-all duration-300 active:scale-90 ${
                  active ? "bg-white/90 font-semibold text-rose-700 shadow-[inset_0_1px_0_#fff,0_6px_14px_-8px_rgba(136,19,55,0.45)]" : "text-stone-500"
                }`}
              >
                <span className={`text-[22px] leading-none transition-transform duration-300 ${active ? "scale-110" : "opacity-70 grayscale-[60%]"}`}>{t.icon}</span>
                {t.label}
              </Link>
            );
          })}
          <button
            onClick={() => setOpen(true)}
            className={`flex flex-col items-center gap-0.5 rounded-[20px] py-1.5 text-[10.5px] transition-all duration-300 active:scale-90 ${
              !inTabs ? "bg-white/90 font-semibold text-rose-700 shadow-[inset_0_1px_0_#fff,0_6px_14px_-8px_rgba(136,19,55,0.45)]" : "text-stone-500"
            }`}
          >
            <span className="flex h-[22px] flex-col items-center justify-center gap-[3px]">
              <span className="h-[2px] w-4 rounded-full bg-current" />
              <span className="h-[2px] w-4 rounded-full bg-current" />
              <span className="h-[2px] w-4 rounded-full bg-current" />
            </span>
            Menu
          </button>
        </div>
      </nav>

      {/* ===== Bottom sheet kaca: semua menu ===== */}
      <div className={`fixed inset-0 z-50 md:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-stone-900/25 backdrop-blur-[2px] transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        />
        <div
          className={`glass-strong absolute inset-x-2 bottom-2 max-h-[85vh] overflow-y-auto rounded-[32px] px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3 transition-all duration-500 ease-[cubic-bezier(0.2,0.9,0.2,1)] ${
            open ? "translate-y-0 opacity-100" : "translate-y-[110%] opacity-0"
          }`}
        >
          <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-stone-400/40" />
          {GROUPS.map((g) => (
            <div key={g.title} className="mb-4">
              <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500">{g.title}</p>
              <div className="grid grid-cols-4 gap-2">
                {g.items.map((i) => {
                  const active = isActive(i.href);
                  return (
                    <Link
                      key={i.href}
                      href={i.href}
                      className={`flex flex-col items-center gap-1.5 rounded-2xl p-1.5 text-center text-[11px] leading-tight transition active:scale-90 ${
                        active ? "font-semibold text-rose-700" : "text-stone-700"
                      }`}
                    >
                      <span
                        className={`flex h-14 w-14 items-center justify-center rounded-[20px] text-2xl ${
                          active
                            ? "bg-gradient-to-br from-rose-400 to-rose-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_8px_18px_-8px_rgba(225,29,72,0.8)]"
                            : "glass-pill"
                        }`}
                      >
                        {i.icon}
                      </span>
                      {i.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
          <form action={signOut}>
            <button className="glass-pill w-full rounded-2xl py-3 text-sm text-stone-600">↩︎ Keluar</button>
          </form>
        </div>
      </div>
    </>
  );
}
