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

  // tutup menu saat pindah halaman + kunci scroll saat menu terbuka
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
      {/* ===== Sidebar desktop ===== */}
      <aside className="no-print sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-rose-100 bg-white md:flex">
        <div className="border-b border-rose-50 px-5 py-5">
          <Link href="/dashboard" className="text-lg font-semibold text-rose-700">💍 NikahKu</Link>
          <p className="mt-1 truncate text-sm font-medium text-stone-700">{couple}</p>
          <p className="text-xs text-rose-600">{countdown}</p>
        </div>
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-stone-400">{g.title}</p>
              {g.items.map((i) => {
                const active = isActive(i.href);
                return (
                  <Link
                    key={i.href}
                    href={i.href}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      active ? "bg-rose-50 font-medium text-rose-700" : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                    }`}
                  >
                    <span className={`text-base transition-transform group-hover:scale-110 ${active ? "" : "grayscale-[40%]"}`}>{i.icon}</span>
                    {i.label}
                    {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-rose-500" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <form action={signOut} className="border-t border-rose-50 p-3">
          <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-stone-500 hover:bg-stone-50">↩︎ Keluar</button>
        </form>
      </aside>

      {/* ===== Header mobile ===== */}
      <header className="no-print sticky top-0 z-30 flex items-center justify-between border-b border-rose-100 bg-white/85 px-4 py-3 backdrop-blur md:hidden">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold">{current ? `${current.icon} ${current.label}` : "💍 NikahKu"}</p>
          <p className="truncate text-xs text-stone-500">{couple} · <span className="text-rose-600">{countdown}</span></p>
        </div>
      </header>

      {/* ===== Tab bar bawah mobile ===== */}
      <nav className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-rose-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <div className="grid grid-cols-5">
          {TABS.map((t) => {
            const active = isActive(t.href);
            return (
              <Link key={t.href} href={t.href} className="relative flex flex-col items-center gap-0.5 py-2 text-[11px]">
                <span className={`text-xl transition-transform duration-200 ${active ? "-translate-y-0.5 scale-110" : "opacity-60 grayscale"}`}>{t.icon}</span>
                <span className={active ? "font-semibold text-rose-700" : "text-stone-500"}>{t.label}</span>
                {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-rose-500" />}
              </Link>
            );
          })}
          <button onClick={() => setOpen(true)} className="relative flex flex-col items-center gap-0.5 py-2 text-[11px]">
            <span className={`text-xl ${!inTabs ? "scale-110" : "opacity-60 grayscale"}`}>☰</span>
            <span className={!inTabs ? "font-semibold text-rose-700" : "text-stone-500"}>Menu</span>
            {!inTabs && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-rose-500" />}
          </button>
        </div>
      </nav>

      {/* ===== Bottom sheet menu lengkap ===== */}
      <div className={`fixed inset-0 z-50 md:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-stone-900/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        />
        <div
          className={`absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-3 shadow-2xl transition-transform duration-300 ease-out ${
            open ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-stone-200" />
          {GROUPS.map((g) => (
            <div key={g.title} className="mb-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400">{g.title}</p>
              <div className="grid grid-cols-4 gap-2">
                {g.items.map((i) => {
                  const active = isActive(i.href);
                  return (
                    <Link
                      key={i.href}
                      href={i.href}
                      className={`flex flex-col items-center gap-1 rounded-2xl p-2 text-center text-[11px] leading-tight transition active:scale-95 ${
                        active ? "bg-rose-50 font-semibold text-rose-700" : "text-stone-600"
                      }`}
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-2xl">{i.icon}</span>
                      {i.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
          <form action={signOut}>
            <button className="w-full rounded-xl border border-stone-200 py-3 text-sm text-stone-600">↩︎ Keluar</button>
          </form>
        </div>
      </div>
    </>
  );
}
