import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Invitation, Wish } from "@/lib/types";
import { submitRsvp } from "./actions";

type PublicData = {
  groom_name: string;
  bride_name: string;
  wedding_date: string;
  city: string | null;
  invitation: Invitation;
  guest: { name: string; pax: number; rsvp_status: string } | null;
  wishes: Wish[];
};

const THEMES = {
  rose: { bg: "bg-rose-50", hero: "from-rose-900/70", accent: "text-rose-700", btn: "bg-rose-600 hover:bg-rose-700", border: "border-rose-200" },
  emerald: { bg: "bg-emerald-50", hero: "from-emerald-900/70", accent: "text-emerald-700", btn: "bg-emerald-600 hover:bg-emerald-700", border: "border-emerald-200" },
  slate: { bg: "bg-slate-100", hero: "from-slate-900/80", accent: "text-slate-800", btn: "bg-slate-800 hover:bg-slate-900", border: "border-slate-300" },
  amber: { bg: "bg-amber-50", hero: "from-amber-900/70", accent: "text-amber-700", btn: "bg-amber-600 hover:bg-amber-700", border: "border-amber-200" },
} as const;

async function load(slug: string, code?: string) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_invitation", { p_slug: slug, p_code: code ?? null });
  return (data ?? null) as PublicData | null;
}

const longDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

function calendarLink(title: string, date: string, location: string) {
  const start = date.replace(/-/g, "");
  const next = new Date(date + "T00:00:00Z");
  next.setUTCDate(next.getUTCDate() + 1);
  const end = next.toISOString().slice(0, 10).replace(/-/g, "");
  const p = new URLSearchParams({ action: "TEMPLATE", text: title, dates: `${start}/${end}`, location });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const d = await load(slug);
  if (!d) return { title: "Undangan tidak ditemukan" };
  const title = `Undangan Pernikahan ${d.groom_name} & ${d.bride_name}`;
  return {
    title,
    description: longDate(d.wedding_date),
    openGraph: { title, description: longDate(d.wedding_date), images: d.invitation.cover_url ? [d.invitation.cover_url] : [] },
  };
}

export default async function PublicInvitation({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ to?: string; c?: string; sent?: string; err?: string }>;
}) {
  const { slug } = await params;
  const { to = "", c = "", sent, err } = await searchParams;
  const d = await load(slug, c);
  if (!d) return notFound();

  const inv = d.invitation;
  const th = THEMES[inv.theme ?? "rose"];
  const guestName = d.guest?.name ?? to;
  const days = Math.max(0, Math.round((new Date(d.wedding_date + "T00:00:00").getTime() - Date.now()) / 86_400_000));
  const couple = `${d.groom_name} & ${d.bride_name}`;

  return (
    <main className={`min-h-screen ${th.bg} text-stone-800`}>
      {/* Sampul */}
      <section
        className="relative flex min-h-[90vh] items-end bg-stone-800 bg-cover bg-center"
        style={inv.cover_url ? { backgroundImage: `url(${inv.cover_url})` } : undefined}
      >
        <div className={`absolute inset-0 bg-gradient-to-t ${th.hero} to-transparent`} />
        <div className="relative mx-auto w-full max-w-lg px-6 pb-16 text-center text-white">
          <p className="mb-2 text-sm uppercase tracking-[0.3em] opacity-80">The Wedding of</p>
          <h1 className="mb-3 font-serif text-5xl">{d.groom_name} <span className="opacity-70">&amp;</span> {d.bride_name}</h1>
          <p className="mb-6 opacity-90">{longDate(d.wedding_date)}</p>
          {guestName && (
            <div className="mx-auto max-w-xs rounded-xl bg-white/15 p-4 backdrop-blur">
              <p className="text-xs opacity-80">Kepada Yth. Bapak/Ibu/Saudara/i</p>
              <p className="text-lg font-semibold">{guestName}</p>
            </div>
          )}
          {days > 0 && <p className="mt-6 text-sm opacity-80">{days} hari lagi</p>}
        </div>
      </section>

      <div className="mx-auto max-w-lg space-y-10 px-6 py-14 text-center">
        {inv.opening && <p className="leading-relaxed">{inv.opening}</p>}
        {inv.quote && <blockquote className={`border-y ${th.border} py-4 italic text-stone-600`}>{inv.quote}</blockquote>}

        {/* Mempelai */}
        <section className="space-y-6">
          <div>
            <h2 className={`font-serif text-3xl ${th.accent}`}>{inv.groom_full || d.groom_name}</h2>
            {inv.groom_parents && <p className="text-sm text-stone-600">Putra dari {inv.groom_parents}</p>}
          </div>
          <p className={`font-serif text-3xl ${th.accent}`}>&amp;</p>
          <div>
            <h2 className={`font-serif text-3xl ${th.accent}`}>{inv.bride_full || d.bride_name}</h2>
            {inv.bride_parents && <p className="text-sm text-stone-600">Putri dari {inv.bride_parents}</p>}
          </div>
        </section>

        {/* Acara */}
        <section className="grid gap-4">
          {(inv.akad_place || inv.akad_time) && (
            <div className={`rounded-2xl border ${th.border} bg-white p-6`}>
              <h3 className={`mb-2 font-serif text-2xl ${th.accent}`}>Akad Nikah</h3>
              <p className="font-medium">{longDate(d.wedding_date)}</p>
              {inv.akad_time && <p>{inv.akad_time}</p>}
              {inv.akad_place && <p className="mt-2 font-medium">{inv.akad_place}</p>}
              {inv.akad_address && <p className="text-sm text-stone-600">{inv.akad_address}</p>}
            </div>
          )}
          {(inv.resepsi_place || inv.resepsi_time) && (
            <div className={`rounded-2xl border ${th.border} bg-white p-6`}>
              <h3 className={`mb-2 font-serif text-2xl ${th.accent}`}>Resepsi</h3>
              <p className="font-medium">{longDate(inv.resepsi_date || d.wedding_date)}</p>
              {inv.resepsi_time && <p>{inv.resepsi_time}</p>}
              {inv.resepsi_place && <p className="mt-2 font-medium">{inv.resepsi_place}</p>}
              {inv.resepsi_address && <p className="text-sm text-stone-600">{inv.resepsi_address}</p>}
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-2">
            {inv.maps_url && (
              <a href={inv.maps_url} target="_blank" className={`rounded-full px-5 py-2 text-sm text-white ${th.btn}`}>📍 Buka Google Maps</a>
            )}
            <a
              href={calendarLink(`Pernikahan ${couple}`, d.wedding_date, inv.resepsi_place || inv.akad_place || d.city || "")}
              target="_blank"
              className={`rounded-full border ${th.border} bg-white px-5 py-2 text-sm`}
            >
              🗓️ Simpan ke kalender
            </a>
          </div>
        </section>

        {inv.story && (
          <section>
            <h3 className={`mb-3 font-serif text-2xl ${th.accent}`}>Cerita Kami</h3>
            <p className="whitespace-pre-line leading-relaxed text-stone-700">{inv.story}</p>
          </section>
        )}

        {inv.gift_info && (
          <section className={`rounded-2xl border ${th.border} bg-white p-6`}>
            <h3 className={`mb-2 font-serif text-2xl ${th.accent}`}>Tanda Kasih</h3>
            <p className="text-sm text-stone-600">Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih:</p>
            <p className="mt-2 whitespace-pre-line font-medium">{inv.gift_info}</p>
          </section>
        )}

        {/* RSVP */}
        <section id="rsvp" className={`rounded-2xl border ${th.border} bg-white p-6 text-left`}>
          <h3 className={`mb-4 text-center font-serif text-2xl ${th.accent}`}>Konfirmasi Kehadiran</h3>
          {sent ? (
            <p className="text-center text-emerald-700">Terima kasih, konfirmasi &amp; ucapan Anda sudah kami terima 🙏</p>
          ) : (
            <form action={submitRsvp.bind(null, slug, c, to)} className="space-y-3">
              <input name="name" required defaultValue={guestName} placeholder="Nama"
                     className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
              <div className="flex gap-2">
                <select name="attendance" defaultValue="hadir" className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm">
                  <option value="hadir">Ya, saya akan hadir</option>
                  <option value="tidak">Maaf, tidak bisa hadir</option>
                </select>
                <select name="pax" defaultValue={String(d.guest?.pax ?? 1)} className="w-28 rounded-lg border border-stone-300 px-3 py-2 text-sm">
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} orang</option>)}
                </select>
              </div>
              <textarea name="message" rows={3} maxLength={1000} placeholder="Ucapan & doa untuk mempelai"
                        className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
              {err && <p className="text-sm text-red-600">Gagal mengirim, coba lagi.</p>}
              <button className={`w-full rounded-lg py-2 text-sm font-medium text-white ${th.btn}`}>Kirim</button>
            </form>
          )}
        </section>

        {/* Ucapan */}
        {d.wishes.length > 0 && (
          <section className="text-left">
            <h3 className={`mb-3 text-center font-serif text-2xl ${th.accent}`}>Ucapan &amp; Doa</h3>
            <ul className="max-h-96 space-y-2 overflow-y-auto">
              {d.wishes.map((w, i) => (
                <li key={i} className="rounded-xl bg-white p-3 text-sm shadow-sm">
                  <p className="font-medium">{w.name}</p>
                  <p className="text-stone-700">{w.message}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="pt-6 text-sm text-stone-500">
          <p className={`mb-1 font-serif text-xl ${th.accent}`}>{couple}</p>
          <p>Terima kasih atas doa &amp; restunya.</p>
          <p className="mt-6 text-xs opacity-60">Dibuat dengan 💍 NikahKu</p>
        </footer>
      </div>
    </main>
  );
}
