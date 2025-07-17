# ⚙️ Grafana Panel Settings Guide

## Panel Settings Location

Panel settings berada di **sidebar kanan** (sebelah kanan grafik). Scroll ke bawah untuk melihat semua opsi.

## 📋 Langkah-langkah Konfigurasi Panel

### 1. Panel Options (Paling Atas)

```
┌─────────────────────────────────┐
│ Panel options                   │
│ ┌─────────────────────────────┐ │
│ │ Title: "HTTP Request Rate"  │ │
│ │ Description: [kosong]       │ │
│ │ Transparent background: ☐   │ │
│ │ Panel links: [dropdown]     │ │
│ │ Repeat options: [dropdown]  │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Yang perlu diubah:**

- **Title**: Ganti "New panel" menjadi "HTTP Request Rate"
- **Description**: Tambahkan deskripsi (opsional)

### 2. Visualization

```
┌─────────────────────────────────┐
│ Visualization                   │
│ ┌─────────────────────────────┐ │
│ │ Time series ◄ (selected)    │ │
│ │ Graph                        │ │
│ │ Heatmap                      │ │
│ │ Stat                         │ │
│ │ Table                        │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Pilihan yang disarankan:**

- **Time series**: Untuk grafik garis (sudah benar)
- **Stat**: Untuk nilai tunggal (misal: total requests)
- **Table**: Untuk data tabular

### 3. Tooltip

```
┌─────────────────────────────────┐
│ Tooltip                        │
│ ┌─────────────────────────────┐ │
│ │ Tooltip mode: ● Single      │ │
│ │           ○ All             │ │
│ │           ○ Hidden          │ │
│ │ Hover proximity: 10px       │ │
│ │ Max width: 300px            │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Rekomendasi:**

- **Tooltip mode**: Single (sudah benar)
- **Hover proximity**: 10px (default)
- **Max width**: 300px (default)

### 4. Legend

```
┌─────────────────────────────────┐
│ Legend                         │
│ ┌─────────────────────────────┐ │
│ │ Display mode: ● List        │ │
│ │           ○ Table           │ │
│ │           ○ Hidden          │ │
│ │ Legend placement: Bottom    │ │
│ │ Legend values: ☑ Mean       │ │
│ │           ☑ Max             │ │
│ │           ☑ Min             │ │
│ │           ☑ Current         │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Rekomendasi:**

- **Display mode**: List (sudah benar)
- **Legend placement**: Bottom
- **Legend values**: Centang semua (Mean, Max, Min, Current)

### 5. Axis

```
┌─────────────────────────────────┐
│ Axis                           │
│ ┌─────────────────────────────┐ │
│ │ Y:                          │ │
│ │   Label: "Requests/sec"     │ │
│ │   Unit: "short"             │ │
│ │   Min: auto                 │ │
│ │   Max: auto                 │ │
│ │   Decimals: 2               │ │
│ │ X:                          │ │
│ │   Label: "Time"             │ │
│ │   Show: ☑                   │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Yang perlu diubah:**

- **Y Label**: "Requests/sec"
- **Y Unit**: "short" (untuk angka)
- **Y Decimals**: 2 (untuk 2 desimal)

### 6. Graph Styles

```
┌─────────────────────────────────┐
│ Graph styles                   │
│ ┌─────────────────────────────┐ │
│ │ Line width: 1               │ │
│ │ Fill opacity: 10            │ │
│ │ Gradient mode: None         │ │
│ │ Show points: Never          │ │
│ │ Point size: 5               │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Rekomendasi:**

- **Line width**: 2 (agar lebih tebal)
- **Fill opacity**: 10 (sudah benar)
- **Show points**: Never (sudah benar)

### 7. Standard Options

```
┌─────────────────────────────────┐
│ Standard options               │
│ ┌─────────────────────────────┐ │
│ │ Unit: short                 │ │
│ │ Min: auto                   │ │
│ │ Max: auto                   │ │
│ │ Decimals: 2                 │ │
│ │ Display name: [kosong]      │ │
│ │ No value: 0                 │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Yang perlu diubah:**

- **Unit**: "short" (untuk angka)
- **Decimals**: 2
- **Display name**: Kosong (akan menggunakan legend)

## 🎯 Konfigurasi Lengkap untuk Panel Pertama

### Query Editor (Bagian Kiri):

```promql
rate(http_requests_total{route="/api/users"}[5m])
```

### Panel Settings (Sidebar Kanan):

1. **Panel options**:

   - Title: "HTTP Request Rate"
   - Description: "Rate of HTTP requests to /api/users endpoint"

2. **Axis**:

   - Y Label: "Requests/sec"
   - Y Unit: "short"
   - Y Decimals: 2

3. **Legend**:

   - Display mode: List
   - Legend placement: Bottom
   - Legend values: ☑ Mean, ☑ Max, ☑ Min, ☑ Current

4. **Graph styles**:
   - Line width: 2
   - Fill opacity: 10
   - Show points: Never

## 🚀 Langkah Selanjutnya

Setelah panel pertama selesai:

1. **Klik "Save dashboard"** (tombol biru di pojok kanan atas)
2. **Klik "Add panel"** untuk menambah panel kedua
3. **Ulangi proses** dengan query yang berbeda

### Query untuk Panel Kedua:

```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{route="/api/users"}[5m]))
```

### Query untuk Panel Ketiga:

```promql
process_resident_memory_bytes
```

## ✅ Checklist Panel Settings

- [ ] Title diubah dari "New panel"
- [ ] Y-axis label ditambahkan
- [ ] Unit diset ke "short"
- [ ] Decimals diset ke 2
- [ ] Legend ditampilkan di bottom
- [ ] Line width ditingkatkan ke 2
- [ ] Panel disimpan

## 🎉 Success Indicators

Panel berhasil dikonfigurasi jika:

- [ ] Title tidak lagi "New panel"
- [ ] Grafik menampilkan data dengan jelas
- [ ] Legend menampilkan informasi yang berguna
- [ ] Axis label mudah dibaca
