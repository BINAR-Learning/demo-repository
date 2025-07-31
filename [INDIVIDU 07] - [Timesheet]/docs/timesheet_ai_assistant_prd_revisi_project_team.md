# 📄 Product Requirements Document (PRD)

## Project Name: Timesheet AI Assistant
**Date**: 31 Juli 2025  
**Author**: Ah Wirayudha  
**Version**: 2.0 (Updated with Project & Team Management)

---

## 1. Executive Summary
Timesheet AI Assistant adalah aplikasi pencatatan waktu kerja dengan fitur analisis dan rekomendasi workload berbasis AI (Google Gemini Free). Aplikasi ini ditujukan untuk profesional individu atau tim kecil yang ingin memahami distribusi kerja dan mendapatkan insight produktivitas secara otomatis.

**Status Implementasi Saat Ini:**
- ✅ Authentication & User Management
- ✅ Team Management (Create, Invite, Remove Members)
- ✅ Timesheet Logging (Basic CRUD)
- ✅ AI Analysis (Weekly, Monthly, Yearly)
- ✅ Analytics Dashboard
- ✅ Export & Share Features
- ❌ Project Management (Missing)
- ❌ Project-based Timesheet Association
- ❌ Project-specific Analytics

---

## 2. Goals & Objectives
- Menyediakan cara sederhana dan cepat untuk mencatat waktu kerja.
- Memberikan analisis beban kerja berbasis AI.
- Menyediakan ringkasan dan rekap aktivitas kerja yang mudah dibagikan.
- **NEW**: Manajemen project dan tim untuk kolaborasi yang lebih baik.
- **NEW**: Analisis produktivitas per project dan per anggota tim.

---

## 3. Target User
- Freelancer / pekerja lepas.
- Pekerja remote.
- Tim kecil/startup.
- **NEW**: Project managers dan team leaders.

---

## 4. Key Features

### 4.0 Project & Team Management ✅ (Partially Implemented)
- ✅ User dapat membuat dan memilih project pada saat mengisi timesheet.
- ✅ Setiap aktivitas timesheet akan terasosiasi dengan salah satu project.
- ✅ Dashboard analisa juga menampilkan insight berdasarkan project.
- ✅ Admin (pemilik akun) dapat:
  - ✅ Membuat sebuah company/team.
  - ✅ Menambahkan user lain ke dalam company dan ke project tertentu.
  - ✅ Melihat aktivitas dan beban kerja tim berdasarkan project.
- ❌ **MISSING**: Project creation and management interface
- ❌ **MISSING**: Project selection in timesheet form
- ❌ **MISSING**: Project-based analytics and insights

### 4.1 Timesheet Logging ✅ (Implemented)
- ✅ Tambah/edit/hapus aktivitas kerja.
- ✅ Form: tanggal, jam mulai, jam selesai, kategori, deskripsi.
- ❌ **MISSING**: Project selection in form
- ❌ **MISSING**: Project association for activities

### 4.2 AI Workload Analysis ✅ (Implemented)
- ✅ Kirim data ke Gemini API untuk analisa beban kerja.
- ✅ Periode analisa:
  - ✅ **Mingguan**: Insight rutin tiap akhir pekan.
  - ✅ **Bulanan**: Analisa tren dan fluktuasi workload.
  - ✅ **Tahunan**: Ringkasan performa dan produktivitas tahunan.
- ✅ Insight yang diberikan AI:
  - ✅ Identifikasi pola kerja berlebihan (overwork).
  - ✅ Rekomendasi waktu istirahat atau redistribusi tugas.
  - ✅ Deteksi ketidakseimbangan antara kategori pekerjaan.
- ✅ Tampilkan hasil AI secara visual dan deskriptif di dashboard.
- ❌ **MISSING**: Project-specific AI analysis

### 4.3 Summary Dashboard ✅ (Implemented)
- ✅ Ringkasan total jam kerja.
- ✅ Grafik distribusi waktu per kategori.
- ✅ Highlight rekomendasi AI.
- ❌ **MISSING**: Project-based statistics
- ❌ **MISSING**: Team member productivity comparison

### 4.4 Export & Share ✅ (Implemented)
- ✅ Ekspor ke CSV.
- ✅ Salin ringkasan ke clipboard.
- ❌ **MISSING**: PDF export
- ❌ **MISSING**: Project-specific exports

### 4.5 Authentication ✅ (Implemented)
- ✅ Login via email/password.
- ✅ Team-based access control.
- ✅ Role-based permissions (owner/member).

---

## 5. Non-Functional Requirements
- ✅ Responsif (desktop & mobile).
- ✅ Waktu muat < 2 detik.
- ✅ Privasi data: data tidak dikirim kecuali dengan izin user.
- ✅ Gratis dan hemat biaya API (free tier Gemini).

---

## 6. Tech Stack ✅ (Implemented)
| Layer       | Tech                     | Status |
|-------------|--------------------------|---------|
| Framework   | Next.js 15.4.0          | ✅ |
| Database    | PostgreSQL              | ✅ |
| ORM         | Drizzle ORM             | ✅ |
| Authentication | Custom Auth           | ✅ |
| UI Library  | shadcn/ui               | ✅ |
| Deployment  | Vercel                  | ✅ |

---

## 7. User Flow
1. ✅ User buka aplikasi dan login.
2. ✅ Isi timesheet harian (missing project selection).
3. ✅ Klik "Analisa AI".
4. ✅ Lihat insight dari Gemini.
5. ✅ Akses ringkasan mingguan, bulanan, dan tahunan.
6. ✅ Ekspor/share.
7. ✅ Admin menambahkan anggota ke team.
8. ❌ **MISSING**: Admin creates and manages projects.
9. ❌ **MISSING**: User selects project when logging timesheet.

---

## 8. Expected Output
- ✅ Aplikasi pencatatan kerja sederhana berbasis web.
- ✅ Analisa dan saran AI berdasarkan data pengguna.
- ✅ Insight AI mingguan, bulanan, dan tahunan.
- ✅ Perbandingan beban kerja antar periode.
- ✅ Rekomendasi berbasis pola jangka panjang (burnout, underutilization).
- ✅ Ringkasan aktivitas mingguan/bulanan/tahunan dalam format visual dan teks.
- ✅ Sistem manajemen tim dengan role admin dan user biasa.
- ❌ **MISSING**: Project management system
- ❌ **MISSING**: Project-based analytics
- ❌ **MISSING**: Team productivity insights per project

---

## 9. Future Scope (Optional)
- Reminder otomatis isi timesheet.
- Integrasi Google Calendar.
- Workspace tim.
- Mobile App (PWA).
- **NEW**: Advanced project analytics and reporting.
- **NEW**: Time tracking integrations (Toggl, Harvest, etc.).

---

# ✅ Backlog / Checklist

## Timesheet Feature ✅ (Mostly Complete)
- ✅ Form input aktivitas
  - ✅ Input tanggal
  - ✅ Input jam mulai & selesai (validasi tidak tumpang tindih)
  - ✅ Pilihan kategori
  - ❌ **MISSING**: Pilihan project
  - ✅ Textarea deskripsi
- ✅ Simpan data ke Postgres via Drizzle
- ✅ CRUD activity log
  - ✅ List aktivitas harian
  - ✅ Edit & hapus aktivitas

## Project & Team Management ✅ (Partially Complete)
- ✅ Buat struktur company/team
- ✅ Admin dapat menambahkan user ke dalam team
- ❌ **MISSING**: Admin dapat membuat project dalam team
- ❌ **MISSING**: Setiap user bisa mengisi timesheet untuk project tertentu
- ❌ **MISSING**: Akses kontrol: user hanya bisa akses project yang diikutinya
- ❌ **MISSING**: Admin dapat melihat statistik dan insight per project & per user

## Dashboard ✅ (Mostly Complete)
- ✅ Hitung total jam kerja per minggu
- ✅ Grafik distribusi aktivitas (misal pie chart)
- ✅ Komponen highlight insight/rekomendasi AI
- ❌ **MISSING**: Project-based statistics
- ❌ **MISSING**: Team member comparison

## AI Integration ✅ (Complete)
- ✅ Setup integrasi ke Gemini API (Free tier)
  - ✅ Buat endpoint API route di Next.js
- ✅ Kirim data timesheet mingguan
  - ✅ Serialize & kirim data dalam prompt format
- ✅ Tampilkan insight dan rekomendasi dari AI
  - ✅ Tangkap response Gemini dan tampilkan di UI
- ✅ Analisa workload mingguan
  - ✅ Kirim data aktivitas 7 hari terakhir ke Gemini
  - ✅ Tampilkan insight di dashboard
- ✅ Analisa workload bulanan
  - ✅ Agregasi data 30 hari terakhir
  - ✅ Tampilkan tren bulanan (grafik + insight)
- ✅ Analisa workload tahunan
  - ✅ Rekap data tahunan pengguna
  - ✅ Insight tentang peningkatan/penurunan produktivitas
  - ✅ Deteksi burnout atau overwork tahunan
- ❌ **MISSING**: Project-specific AI analysis

## Export & Share ✅ (Mostly Complete)
- ✅ Ekspor ke CSV
- ❌ **MISSING**: Ekspor ke PDF
- ✅ Tombol salin ke clipboard untuk insight

## Authentication ✅ (Complete)
- ✅ Setup custom authentication
- ✅ Login via email/password
- ✅ Team-based access control
- ✅ Role-based permissions

## Deployment ✅ (Complete)
- ✅ Deploy ke Vercel
- ✅ Setup environment variables production di Vercel

## Testing ❌ (Not Started)
- ❌ Unit test komponen (menggunakan Jest atau React Testing Library)
- ❌ E2E test dengan Playwright atau Cypress
  - ❌ Isi aktivitas ➝ analisa ➝ lihat ringkasan

---

# 🚀 Next Steps for Implementation

## Priority 1: Project Management
1. **Add Projects Table to Database Schema**
   - Create `projects` table with fields: id, name, description, teamId, createdAt, updatedAt
   - Add `projectId` field to `timesheet_activities` table
   - Update relations and types

2. **Create Project Management UI**
   - Add "Projects" page in dashboard
   - Create project form (name, description)
   - Project list with edit/delete functionality
   - Project selection dropdown in timesheet form

3. **Update Timesheet Form**
   - Add project selection dropdown
   - Validate project access permissions
   - Associate activities with selected project

## Priority 2: Project-based Analytics
1. **Update Dashboard**
   - Add project filter dropdown
   - Show project-specific statistics
   - Project-based category distribution
   - Team member productivity per project

2. **Update AI Analysis**
   - Include project data in AI analysis
   - Project-specific insights and recommendations
   - Cross-project workload analysis

## Priority 3: Enhanced Team Features
1. **Team Analytics**
   - Team member productivity comparison
   - Project assignment tracking
   - Team workload distribution

2. **Advanced Permissions**
   - Project-level access control
   - Role-based project permissions
   - Admin project management tools
