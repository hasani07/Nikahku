import Link from "next/link";
import { requireWedding } from "@/lib/wedding";
import { signOut } from "./actions";

const NAV: [string, string, string][] = [
  ["/dashboard", "🏠", "Dashboard"],
  ["/checklist", "✅", "Checklist"],
  ["/budget", "💰", "Budget"],
  ["/savings", "🐷", "Tabungan"],
  ["/vendors", "🤝", "Vendor"],
  ["/documents", "📄", "Dokumen"],
  ["/guests", "👥", "Tamu"],
  ["/invitation", "💌", "Undangan"],
  ["/rundown", "🕒", "Rundown"],
  ["/hari-h", "🎉", "Hari H"],
  ["/gifts", "🎁", "Amplop & Hadiah"],
  ["/guide", "📖", "Panduan"],
  ["/settings", "⚙️", "Pengaturan"],
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { wedding } = await requireWedding();

  return (
    <div className="md:flex">
      <aside className="border-b border-rose-100 bg-white md:sticky md:top-0 md:h-screen md:w-56 md:shrink-0 md:overflow-y-auto md:border-b-0 md:border-r">
        <div className="px-5 py-4">
          <Link href="/dashboard" className="font-semibold text-rose-700">💍 NikahKu</Link>
          <p className="truncate text-xs text-stone-500">
            {wedding.groom_name} &amp; {wedding.bride_name}
          </p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col">
          {NAV.map(([href, icon, text]) => (
            <Link
              key={href}
              href={href}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm hover:bg-rose-50"
            >
              {icon} {text}
            </Link>
          ))}
          <form action={signOut} className="md:mt-4">
            <button className="whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm text-stone-500 hover:bg-stone-50">
              ↩︎ Keluar
            </button>
          </form>
        </nav>
      </aside>
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8">{children}</main>
    </div>
  );
}
