# 💍 NikahKu — Wedding Planner

Next.js 15 (App Router, Server Actions) + Supabase (Postgres, Auth, Storage, RLS) + Tailwind CSS v4.
Siap deploy ke Vercel.

## Fitur

| Menu | Isi |
|---|---|
| 🏠 Dashboard | Hitung mundur, progres checklist, tabungan, budget, vendor, dokumen, tamu, tugas terlambat |
| ✅ Checklist | ±45 tugas otomatis dari 12 bulan → hari H (menyesuaikan agama), PIC, tambah/hapus |
| 💰 Budget | 11 kategori dengan persentase saran, catat DP/termin/lunas (bisa dikaitkan ke vendor), sisa dana, cetak |
| 🐷 Tabungan | Target = total budget, setoran per orang, kebutuhan per bulan, proyeksi tercapai/tidak |
| 🤝 Vendor | Kandidat & vendor terpilih, status (survei→nego→booking→lunas), harga, rating, WA & Instagram, catat pembayaran |
| 📄 Dokumen | Checklist berkas KUA / Dukcapil per mempelai, status, upload scan (bucket privat) |
| 👥 Tamu | Grup, jumlah orang, link WA, RSVP, import banyak sekaligus, export CSV (buka di Excel) |
| 💌 Undangan | Editor undangan digital + tema warna + foto sampul, link personal per tamu, tombol kirim WhatsApp, daftar ucapan |
| 🌐 `/u/[slug]` | Halaman undangan publik: nama tamu, detail akad/resepsi, Google Maps, simpan ke kalender, RSVP & ucapan |
| 🕒 Rundown | Susunan acara akad/resepsi per jam + PIC, isi contoh otomatis, cetak/PDF |
| 🎉 Hari H | Check-in tamu (cari nama), tamu tak terdaftar, kontak darurat vendor, rundown ringkas |
| 🎁 Amplop & Hadiah | Rekap amplop/kado/transfer, total, tanda sudah diberi ucapan terima kasih |
| 📖 Panduan | Tips budget, vendor, dokumen, seserahan, adat, persiapan pasangan |
| ⚙️ Pengaturan | Ubah data pernikahan, geser semua tenggat, undang pasangan/keluarga via link, kelola anggota |
| 📱 PWA | Bisa "Add to Home Screen" di HP |

---

## 1. Setup Supabase

1. <https://supabase.com> → **New project** (region Singapore).
2. **SQL Editor → New query**, jalankan berurutan:
   1. isi file `supabase/migrations/0001_init.sql` → **Run**
   2. isi file `supabase/migrations/0002_full.sql` → **Run**
   (Bucket storage `documents` & `public-assets` ikut dibuat otomatis.)
3. **Project Settings → API**: salin `Project URL` dan `anon public` key.
4. **Authentication → URL Configuration**
   - Site URL: `http://localhost:3000` (setelah deploy ganti ke domain Vercel)
   - Redirect URLs: `http://localhost:3000/**` dan `https://<domain-vercel>/**`
5. (Opsional untuk testing) **Authentication → Sign In / Providers → Email**: matikan *Confirm email* agar bisa langsung login.

## 2. Jalankan lokal

```bash
cp .env.example .env.local   # isi URL & anon key
npm install
npm run dev                  # http://localhost:3000
```

## 3. Deploy ke Vercel

```bash
git init && git add . && git commit -m "NikahKu"
git branch -M main
git remote add origin https://github.com/<username>/nikahku.git
git push -u origin main
```

1. <https://vercel.com/new> → Import repo.
2. Environment Variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` → **Deploy**.
3. Masukkan domain Vercel ke Supabase Site URL & Redirect URLs (langkah 1.4).

Setiap `git push` ke `main` otomatis deploy ulang.

---

## Alur pemakaian

1. Daftar → isi onboarding (nama, tanggal, agama, budget) → checklist/budget/dokumen langsung terisi.
2. **Pengaturan → Undang pasangan** → kirim link ke pasangan; dia daftar & otomatis bergabung.
3. Tambah tamu → **Undangan** → isi detail, centang *Terbitkan* → klik **Kirim WA** per tamu.
4. RSVP & ucapan dari tamu otomatis masuk ke Daftar Tamu & Undangan.
5. Hari H: panitia buka **Hari H** di HP untuk check-in tamu.

## Struktur

```
app/
  page.tsx                 landing
  login/  auth/callback/   autentikasi
  onboarding/              wizard + generate template
  join/[token]/            terima undangan anggota
  u/[slug]/                undangan publik (tanpa login)
  (app)/                   halaman setelah login
    dashboard checklist budget savings vendors documents guests
    invitation rundown hari-h gifts guide settings
components/                tombol cetak & salin
lib/
  templates.ts             ISI TEMPLATE checklist, budget, dokumen (edit di sini)
  supabase/                client & middleware
supabase/migrations/       skema + RLS + RPC
```

## Catatan keamanan

- Semua tabel dilindungi Row Level Security: hanya anggota wedding yang bisa baca/tulis.
- Halaman undangan publik hanya membaca lewat fungsi `get_invitation` (field terbatas) dan menulis lewat `submit_rsvp`.
- Scan dokumen disimpan di bucket privat dan dibuka lewat link sementara 1 jam.
- Syarat dokumen nikah bisa berbeda tiap daerah — cek ulang ke KUA / Dukcapil setempat.

## Ide pengembangan berikutnya

- Reminder email/WA otomatis H-7 (Vercel Cron + Resend / WhatsApp API)
- Login Google (aktifkan di Supabase → Providers → Google)
- Asisten AI tanya-jawab persiapan nikah
- Denah meja / seating plan
- Direktori vendor per kota & paket premium (monetisasi)
