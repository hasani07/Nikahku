import Link from "next/link";
import { btn, btnGhost, card } from "@/lib/ui";

const features = [
  ["📅", "Timeline otomatis", "Isi tanggal nikah, checklist 12 bulan langsung tersusun lengkap dengan tenggat."],
  ["💰", "Budget planner", "Pembagian budget per kategori, catat DP & pelunasan, lihat sisa dana."],
  ["📄", "Dokumen KUA / Dukcapil", "Checklist berkas nikah, status per dokumen, simpan scan dengan aman."],
  ["👥", "Daftar tamu", "Kelompokkan tamu, hitung jumlah orang, pantau konfirmasi kehadiran."],
  ["💌", "Undangan digital + RSVP", "Link personal per tamu, kirim via WhatsApp, terima RSVP & ucapan online."],
  ["🤝", "Vendor manager", "Bandingkan penawaran, catat DP & pelunasan, simpan kontak WhatsApp vendor."],
  ["🐷", "Target tabungan", "Lihat berapa yang harus ditabung per bulan agar target nikah tercapai."],
  ["🎉", "Mode hari H", "Check-in tamu, rundown acara, kontak darurat vendor, rekap amplop."],
];

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-4 md:px-6">
      <nav className="glass-strong sticky top-3 z-20 mb-12 flex items-center justify-between rounded-full py-2 pl-4 pr-2">
        <span className="flex items-center gap-2 font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-rose-600 text-sm">💍</span>
          NikahKu
        </span>
        <Link href="/login" className={btnGhost}>Masuk</Link>
      </nav>

      <section className="mb-16 text-center">
        <p className="glass-pill mx-auto mb-6 inline-flex rounded-full px-4 py-1.5 text-xs font-medium text-rose-700">
          ✨ Gratis · bisa dipakai berdua dengan pasangan
        </p>
        <h1 className="mx-auto mb-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
          Persiapan nikah jadi{" "}
          <span className="bg-gradient-to-r from-rose-600 via-pink-500 to-amber-500 bg-clip-text text-transparent">terarah</span>{" "}
          &amp; tepat waktu
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-base text-stone-600 md:text-lg">
          Checklist, budget, vendor, dokumen nikah, daftar tamu, sampai undangan digital — semua di satu tempat.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/login?mode=daftar" className={btn + " px-7 py-3 text-base"}>Mulai gratis</Link>
          <Link href="/login" className={btnGhost + " px-6 py-3 text-base"}>Saya sudah punya akun</Link>
        </div>

        <div className="float glass-strong mx-auto mt-14 max-w-sm rounded-[32px] p-5 text-left">
          <p className="text-xs text-stone-500">Rina &amp; Dimas · 12 Sep</p>
          <p className="mt-1 text-3xl font-extrabold">128 <span className="text-lg font-semibold text-stone-500">hari lagi</span></p>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/60">
            <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-rose-500 to-amber-400" />
          </div>
          <p className="mt-2 text-xs text-stone-500">Progres persiapan 62% · 3 tugas minggu ini</p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(([icon, title, desc]) => (
          <div key={title} className={card + " glass-hover"}>
            <div className="glass-pill mb-3 flex h-11 w-11 items-center justify-center rounded-2xl text-2xl">{icon}</div>
            <h3 className="mb-1 font-semibold">{title}</h3>
            <p className="text-sm text-stone-600">{desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
