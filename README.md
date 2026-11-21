# portofolio-grayesi (Vue 3 + Vite)

Sistem informasi portofolio — Grayesi Silitonga (2201020130)
Tugas UAS Interaksi Manusia dan Komputer. Versi ini ditulis ulang dengan **Vue 3 + Vite + Vue Router**;
backend tetap **Supabase** yang sama.

## Menjalankan
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # hasil di dist/
```
(Opsional) salin `.env.example` ke `.env` untuk mengganti URL/key Supabase.

## Halaman
| Route | Isi |
|---|---|
| `/` | Home, About, Projects, Experience, Activity |
| `/articles` | Daftar artikel (realtime) |
| `/contact` | Info kontak, layanan, form pesan |
| `/admin/login` | Login admin |
| `/admin` | Dashboard |
| `/admin/edit` | Cari / edit / hapus konten |
| `/admin/tambah` | Tambah konten |
| `/admin/pesan` | Pesan masuk |

## Deploy (Vercel)
`vercel.json` sudah berisi rewrite agar refresh di route mana pun tetap jalan.
