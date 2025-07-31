# 📄 Product Requirements Document (PRD)

## Project Name: Timesheet AI Assistant
**Date**: 31 Juli 2025  
**Author**: Ah Wirayudha

---

## 1. Executive Summary
Timesheet AI Assistant adalah aplikasi pencatatan waktu kerja dengan fitur analisis dan rekomendasi workload berbasis AI (Google Gemini Free). Aplikasi ini ditujukan untuk profesional individu atau tim kecil yang ingin memahami distribusi kerja dan mendapatkan insight produktivitas secara otomatis.

---

## 2. Goals & Objectives
- Menyediakan cara sederhana dan cepat untuk mencatat waktu kerja.
- Memberikan analisis beban kerja berbasis AI.
- Menyediakan ringkasan dan rekap aktivitas kerja yang mudah dibagikan.

---

## 3. Target User
- Freelancer / pekerja lepas.
- Pekerja remote.
- Tim kecil/startup.

---

## 4. Key Features

### 4.1 Timesheet Logging
- Tambah/edit/hapus aktivitas kerja.
- Form: tanggal, jam mulai, jam selesai, kategori, deskripsi.

### 4.2 AI Workload Analysis (Gemini Integration)
- Kirim data ke Gemini API untuk analisa beban kerja.
- Periode analisa:
  - **Mingguan**: Insight rutin tiap akhir pekan.
  - **Bulanan**: Analisa tren dan fluktuasi workload.
  - **Tahunan**: Ringkasan performa dan produktivitas tahunan.
- Insight yang diberikan AI:
  - Identifikasi pola kerja berlebihan (overwork).
  - Rekomendasi waktu istirahat atau redistribusi tugas.
  - Deteksi ketidakseimbangan antara kategori pekerjaan.
- Tampilkan hasil AI secara visual dan deskriptif di dashboard.

### 4.3 Summary Dashboard
- Ringkasan total jam kerja.
- Grafik distribusi waktu per kategori.
- Highlight rekomendasi AI.

### 4.4 Export & Share
- Ekspor ke PDF atau CSV.
- Salin ringkasan ke clipboard.

### 4.5 Authentication (Opsional)
- Tanpa login: local only.
- Login via Google: sync & multi-device.

---

## 5. Non-Functional Requirements
- Responsif (desktop & mobile).
- Waktu muat < 2 detik.
- Privasi data: data tidak dikirim kecuali dengan izin user.
- Gratis dan hemat biaya API (free tier Gemini).

---

## 6. Tech Stack
| Layer       | Tech                     |
|-------------|--------------------------|
| Framework   | Next.js                 |
| Database    | PostgreSQL              |
| ORM         | Drizzle ORM             |
| Payments    | N/A (Free tier only)   |
| UI Library  | shadcn/ui               |
| Deployment  | Vercel                  |

---

## 7. User Flow
1. User buka aplikasi.
2. Isi timesheet harian.
3. Klik "Analisa AI".
4. Lihat insight dari Gemini.
5. Akses ringkasan mingguan, bulanan, dan tahunan.
6. Ekspor/share.

---

## 8. Expected Output
- Aplikasi pencatatan kerja sederhana berbasis web.
- Analisa dan saran AI berdasarkan data pengguna.
- Insight AI tidak hanya mingguan, tapi juga bulanan dan tahunan.
- Perbandingan beban kerja antar periode.
- Rekomendasi berbasis pola jangka panjang (burnout, underutilization).
- Ringkasan aktivitas mingguan/bulanan/tahunan dalam format visual dan teks.

---

## 9. Future Scope (Optional)
- Reminder otomatis isi timesheet.
- Integrasi Google Calendar.
- Workspace tim.
- Mobile App (PWA).

---

# ✅ Backlog / Checklist

## Timesheet Feature
- [ ] Form input aktivitas
  - [ ] Input tanggal
  - [ ] Input jam mulai & selesai (validasi tidak tumpang tindih)
  - [ ] Pilihan kategori
  - [ ] Textarea deskripsi
- [ ] Simpan data ke Postgres via Drizzle
- [ ] CRUD activity log
  - [ ] List aktivitas harian
  - [ ] Edit & hapus aktivitas

## Dashboard
- [ ] Hitung total jam kerja per minggu
- [ ] Grafik distribusi aktivitas (misal pie chart)
- [ ] Komponen highlight insight/rekomendasi AI

## AI Integration
- [ ] Setup integrasi ke Gemini API (Free tier)
  - [ ] Buat endpoint API route di Next.js
- [ ] Kirim data timesheet mingguan
  - [ ] Serialize & kirim data dalam prompt format
- [ ] Tampilkan insight dan rekomendasi dari AI
  - [ ] Tangkap response Gemini dan tampilkan di UI
- [ ] Analisa workload mingguan
  - [ ] Kirim data aktivitas 7 hari terakhir ke Gemini
  - [ ] Tampilkan insight di dashboard
- [ ] Analisa workload bulanan
  - [ ] Agregasi data 30 hari terakhir
  - [ ] Tampilkan tren bulanan (grafik + insight)
- [ ] Analisa workload tahunan
  - [ ] Rekap data tahunan pengguna
  - [ ] Insight tentang peningkatan/penurunan produktivitas
  - [ ] Deteksi burnout atau overwork tahunan

## Export & Share
- [ ] Ekspor ke PDF/CSV (menggunakan library seperti `jspdf` atau `react-csv`)
- [ ] Tombol salin ke clipboard untuk insight

## Authentication (Optional)
- [ ] Setup NextAuth.js
- [ ] Login via Google
- [ ] Mode guest: data disimpan di localStorage atau IndexedDB

## Deployment
- [ ] Deploy ke Vercel
- [ ] Setup environment variables production di Vercel


## Testing
- [ ] Unit test komponen (menggunakan Jest atau React Testing Library)
- [ ] E2E test dengan Playwright atau Cypress
  - [ ] Isi aktivitas ➝ analisa ➝ lihat ringkasan
