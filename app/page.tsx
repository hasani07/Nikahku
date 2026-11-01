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
    <main className="mx-auto max-w-5xl px-6 py-16">
      <nav className="mb-16 flex items-center justify-between">
        <span className="text-xl font-semibold text-rose-700">💍 NikahKu</span>
        <Link href="/login" className={btnGhost}>Masuk</Link>
      </nav>

      <section className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
          Persiapan nikah jadi <span className="text-rose-600">terarah</span> &amp; tepat waktu
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-stone-600">
          Satu tempat untuk checklist, budget, dokumen nikah, dan daftar tamu — bisa dikerjakan
          bareng pasangan.
        </p>
        <Link href="/login?mode=daftar" className={btn + " px-6 py-3 text-base"}>Mulai gratis</Link>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {features.map(([icon, title, desc]) => (
          <div key={title} className={card}>
            <div className="mb-2 text-2xl">{icon}</div>
            <h3 className="mb-1 font-semibold">{title}</h3>
            <p className="text-sm text-stone-600">{desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
