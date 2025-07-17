# ➕ Cara Menambah Panel Baru di Grafana

## 🚨 Masalah: "Add panel" Tidak Muncul

Ini terjadi karena Anda masih dalam mode "Edit panel". Berikut solusinya:

## 🔧 Solusi Step-by-Step

### Langkah 1: Keluar dari Edit Panel Mode

**Pilih salah satu:**

1. **Klik "Back to dashboard"** (tombol di pojok kanan atas)
2. **Klik "Save dashboard"** (tombol biru di pojok kanan atas)
3. **Klik "Discard panel"** (jika tidak ingin menyimpan perubahan)

### Langkah 2: Tambah Panel Baru

Setelah kembali ke dashboard view:

**Cara 1:**

1. **Klik "Add panel"** (tombol besar di tengah dashboard)
2. Atau **klik ikon "+"** di pojok kanan atas

**Cara 2:**

1. **Klik "Add visualization"** (jika ada)
2. Pilih data source `grafanacloud-imamtaufiqherm-prom`

**Cara 3:**

1. **Klik kanan** di area kosong dashboard
2. Pilih "Add panel" atau "Add visualization"

### Langkah 3: Jika Masih Tidak Muncul

**Cara Manual:**

1. **Buka tab baru** di browser
2. **Buka Grafana Cloud** → Dashboards
3. **Klik "New dashboard"**
4. **Klik "Add visualization"**
5. **Pilih data source** `grafanacloud-imamtaufiqherm-prom`

## 📋 Query untuk Panel-Panel Baru

### Panel 1: HTTP Request Rate (Sudah ada)

```promql
rate(http_requests_total{route="/api/users"}[5m])
```

### Panel 2: Response Time (95th percentile)

```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{route="/api/users"}[5m]))
```

### Panel 3: Memory Usage

```promql
process_resident_memory_bytes
```

### Panel 4: CPU Usage

```promql
rate(process_cpu_seconds_total[5m])
```

### Panel 5: Database Query Duration

```promql
rate(database_query_duration_seconds_sum{query_type="users_query"}[5m]) / rate(database_query_duration_seconds_count{query_type="users_query"}[5m])
```

## 🎯 Dashboard Layout yang Disarankan

```
┌─────────────────┬─────────────────┐
│ HTTP Request    │ Response Time   │
│ Rate            │ (95th %ile)     │
├─────────────────┼─────────────────┤
│ Memory Usage    │ CPU Usage       │
│                 │                 │
├─────────────────┼─────────────────┤
│ Database Query  │ Error Rate      │
│ Duration        │                 │
└─────────────────┴─────────────────┘
```

## 🚀 Cara Cepat: Buat Dashboard Baru

Jika cara di atas tidak berhasil:

1. **Buka Grafana Cloud** → Dashboards
2. **Klik "New dashboard"**
3. **Klik "Add visualization"**
4. **Pilih data source** `grafanacloud-imamtaufiqherm-prom`
5. **Copy-paste query** dari daftar di atas
6. **Save dashboard** dengan nama "Update Profile App Metrics"

## ✅ Checklist Menambah Panel

- [ ] Keluar dari edit panel mode
- [ ] Klik "Add panel" atau "Add visualization"
- [ ] Pilih data source yang benar
- [ ] Masukkan query yang sesuai
- [ ] Set title panel
- [ ] Konfigurasi visualization
- [ ] Save dashboard

## 🎉 Success Indicators

Panel baru berhasil ditambahkan jika:

- [ ] Panel muncul di dashboard
- [ ] Query menampilkan data
- [ ] Visualization sesuai (time series, stat, dll)
- [ ] Panel tersimpan di dashboard
