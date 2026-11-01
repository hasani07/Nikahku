import { requireWedding } from "@/lib/wedding";
import { getOrigin, waLink } from "@/lib/origin";
import { formatDate } from "@/lib/format";
import { btn, card, input, label } from "@/lib/ui";
import CopyButton from "@/components/CopyButton";
import type { Guest, Wish } from "@/lib/types";
import { saveInvitation } from "./actions";

function slugSuggestion(a: string, b: string) {
  return `${a}-${b}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default async function InvitationEditorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { error, saved } = await searchParams;
  const { supabase, wedding } = await requireWedding();
  const inv = wedding.invitation ?? {};
  const origin = await getOrigin();

  const [{ data: g }, { data: w }] = await Promise.all([
    supabase.from("guests").select("*").eq("wedding_id", wedding.id).order("created_at"),
    supabase.from("wishes").select("*").eq("wedding_id", wedding.id).order("created_at", { ascending: false }).limit(30),
  ]);
  const guests = (g ?? []) as Guest[];
  const wishes = (w ?? []) as Wish[];

  const slug = wedding.slug ?? "";
  const baseUrl = slug ? `${origin}/u/${slug}` : "";
  const greeting = wedding.religion === "islam" ? "Assalamu'alaikum Warahmatullahi Wabarakatuh" : "Salam sejahtera";
  const message = (name: string, url: string) =>
    `${greeting}\n\nKepada Yth.\n*${name}*\n\nTanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami:\n\n*${wedding.groom_name} & ${wedding.bride_name}*\n${formatDate(wedding.wedding_date)}\n\nInfo lengkap & konfirmasi kehadiran:\n${url}\n\nMerupakan suatu kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir. Terima kasih 🙏`;

  const f = (name: keyof typeof inv) => (inv[name] as string | undefined) ?? "";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Undangan digital</h1>
        <p className="text-sm text-stone-500">Buat halaman undangan, sebar link personal per tamu, dan terima RSVP + ucapan secara online.</p>
      </header>

      {saved && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">Tersimpan ✓</p>}
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {baseUrl && (
        <section className={card + " flex flex-wrap items-center gap-3"}>
          <span className={`rounded px-2 py-0.5 text-xs ${inv.published ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-600"}`}>
            {inv.published ? "Terbit" : "Draft (belum bisa dibuka tamu)"}
          </span>
          <a href={baseUrl} target="_blank" className="break-all text-sm text-rose-600 hover:underline">{baseUrl}</a>
          <CopyButton text={baseUrl} />
        </section>
      )}

      <form action={saveInvitation} className={card + " space-y-6"}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={label}>Alamat link undangan</label>
            <div className="flex items-center gap-1 text-sm text-stone-500">
              <span>/u/</span>
              <input className={input} name="slug" required defaultValue={slug || slugSuggestion(wedding.groom_name, wedding.bride_name)} />
            </div>
          </div>
          <div>
            <label className={label}>Tema warna</label>
            <select className={input} name="theme" defaultValue={inv.theme ?? "rose"}>
              <option value="rose">Rose (merah muda)</option>
              <option value="emerald">Emerald (hijau)</option>
              <option value="slate">Slate (elegan gelap)</option>
              <option value="amber">Amber (emas)</option>
            </select>
          </div>
        </div>

        <fieldset className="grid gap-4 md:grid-cols-2">
          <legend className="mb-2 font-semibold">Mempelai</legend>
          <div><label className={label}>Nama lengkap pria</label><input className={input} name="groom_full" defaultValue={f("groom_full") || wedding.groom_name} /></div>
          <div><label className={label}>Nama lengkap wanita</label><input className={input} name="bride_full" defaultValue={f("bride_full") || wedding.bride_name} /></div>
          <div><label className={label}>Putra dari</label><input className={input} name="groom_parents" defaultValue={f("groom_parents")} placeholder="Bapak … & Ibu …" /></div>
          <div><label className={label}>Putri dari</label><input className={input} name="bride_parents" defaultValue={f("bride_parents")} placeholder="Bapak … & Ibu …" /></div>
        </fieldset>

        <fieldset className="grid gap-4 md:grid-cols-3">
          <legend className="mb-2 font-semibold">Akad / Pemberkatan — {formatDate(wedding.wedding_date)}</legend>
          <div><label className={label}>Jam</label><input className={input} name="akad_time" defaultValue={f("akad_time")} placeholder="08.00 – 10.00 WIB" /></div>
          <div><label className={label}>Tempat</label><input className={input} name="akad_place" defaultValue={f("akad_place")} placeholder="Masjid / Gedung …" /></div>
          <div><label className={label}>Alamat</label><input className={input} name="akad_address" defaultValue={f("akad_address")} /></div>
        </fieldset>

        <fieldset className="grid gap-4 md:grid-cols-4">
          <legend className="mb-2 font-semibold">Resepsi</legend>
          <div><label className={label}>Tanggal</label><input className={input} type="date" name="resepsi_date" defaultValue={f("resepsi_date") || wedding.wedding_date} /></div>
          <div><label className={label}>Jam</label><input className={input} name="resepsi_time" defaultValue={f("resepsi_time")} placeholder="11.00 – 14.00 WIB" /></div>
          <div><label className={label}>Tempat</label><input className={input} name="resepsi_place" defaultValue={f("resepsi_place")} /></div>
          <div><label className={label}>Alamat</label><input className={input} name="resepsi_address" defaultValue={f("resepsi_address")} /></div>
          <div className="md:col-span-4"><label className={label}>Link Google Maps</label><input className={input} name="maps_url" defaultValue={f("maps_url")} placeholder="https://maps.app.goo.gl/…" /></div>
        </fieldset>

        <fieldset className="grid gap-4">
          <legend className="mb-2 font-semibold">Isi undangan</legend>
          <div><label className={label}>Kalimat pembuka</label><textarea className={input} rows={2} name="opening" defaultValue={f("opening")} placeholder="Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami…" /></div>
          <div><label className={label}>Kutipan / ayat</label><textarea className={input} rows={2} name="quote" defaultValue={f("quote")} /></div>
          <div><label className={label}>Cerita kami (opsional)</label><textarea className={input} rows={3} name="story" defaultValue={f("story")} /></div>
          <div><label className={label}>Info hadiah / amplop digital (opsional)</label><textarea className={input} rows={2} name="gift_info" defaultValue={f("gift_info")} placeholder="Nama bank · nomor rekening · atas nama" /></div>
          <div>
            <label className={label}>Foto sampul</label>
            {inv.cover_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={inv.cover_url} alt="Sampul" className="mb-2 h-32 rounded-lg object-cover" />
            )}
            <input type="file" name="cover" accept="image/*" className="text-sm" />
            {inv.cover_url && <label className="ml-3 text-xs text-stone-500"><input type="checkbox" name="remove_cover" /> hapus foto</label>}
          </div>
        </fieldset>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" defaultChecked={!!inv.published} className="h-4 w-4" />
          Terbitkan undangan (tamu bisa membuka link)
        </label>
        <button className={btn}>Simpan undangan</button>
      </form>

      {baseUrl && (
        <section className={card}>
          <h2 className="mb-1 font-semibold">Sebar ke tamu</h2>
          <p className="mb-3 text-xs text-stone-500">Setiap tamu dapat link pribadi — namanya tampil di undangan dan RSVP-nya otomatis tercatat di Daftar Tamu.</p>
          <ul className="divide-y divide-stone-100 text-sm">
            {guests.map((x) => {
              const url = `${baseUrl}?to=${encodeURIComponent(x.name)}&c=${x.invite_code}`;
              return (
                <li key={x.id} className="flex flex-wrap items-center gap-2 py-2">
                  <span className="flex-1 font-medium">{x.name}</span>
                  <span className="text-xs text-stone-400">{x.rsvp_status === "pending" ? "belum RSVP" : x.rsvp_status}</span>
                  <CopyButton text={url} label="Salin link" />
                  <a target="_blank" href={waLink(x.phone, message(x.name, url))}
                     className="rounded bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700">Kirim WA</a>
                </li>
              );
            })}
            {guests.length === 0 && <li className="py-2 text-stone-400">Tambah tamu dulu di menu Tamu.</li>}
          </ul>
        </section>
      )}

      <section className={card}>
        <h2 className="mb-2 font-semibold">Ucapan &amp; doa masuk ({wishes.length})</h2>
        <ul className="space-y-2 text-sm">
          {wishes.map((x, i) => (
            <li key={x.id ?? i} className="rounded-lg bg-rose-50/60 p-3">
              <p className="font-medium">{x.name} <span className="text-xs font-normal text-stone-500">· {x.attendance === "hadir" ? "Hadir" : "Tidak hadir"}</span></p>
              {x.message && <p className="text-stone-700">{x.message}</p>}
            </li>
          ))}
          {wishes.length === 0 && <li className="text-stone-400">Belum ada.</li>}
        </ul>
      </section>
    </div>
  );
}
