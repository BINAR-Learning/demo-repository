# Langkah-langkah Mengatasi Masalah React Metrics

## Masalah: Panel "React Component Average Render Time" Tidak Menampilkan Data

### Langkah 1: Pastikan Aplikasi Berjalan

```bash
# Start aplikasi Next.js
npm run dev
```

Pastikan aplikasi berjalan di `http://localhost:3000`

### Langkah 2: Test Metrics Endpoint

```bash
# Test endpoint metrics record
curl -X POST http://localhost:3000/api/metrics/record \
  -H "Content-Type: application/json" \
  -d '{
    "metric": "react_component_render_duration_seconds",
    "value": 0.05,
    "labels": {
      "component_name": "UsersPage",
      "page": "users"
    }
  }'
```

Harusnya return: `{"success":true}`

### Langkah 3: Cek Metrics di Endpoint

```bash
# Cek apakah metrics sudah masuk
curl http://localhost:3000/api/metrics | grep react_component_render_duration_seconds
```

### Langkah 4: Generate Test Data

```bash
# Install dependencies
npm install node-fetch@2

# Jalankan script test
node scripts/test-react-metrics-simple.js
```

### Langkah 5: Verifikasi Prometheus

1. Buka http://localhost:9090
2. Klik "Status" > "Targets"
3. Pastikan target `update-profile` berstatus "UP"
4. Klik "Graph"
5. Masukkan query: `react_component_render_duration_seconds`
6. Klik "Execute"

### Langkah 6: Test PromQL Queries

```bash
# Test semua query PromQL
node scripts/test-promql-queries.js
```

### Langkah 7: Perbaiki Query Grafana

Jika data ada di Prometheus tapi tidak muncul di Grafana, gunakan query ini:

#### Query 1: Average Render Time (Tanpa Filter)

```promql
rate(react_component_render_duration_seconds_sum[5m]) / rate(react_component_render_duration_seconds_count[5m])
```

#### Query 2: Average Render Time (Dengan Filter)

```promql
rate(react_component_render_duration_seconds_sum{component_name="UsersPage", page="users"}[5m]) /
rate(react_component_render_duration_seconds_count{component_name="UsersPage", page="users"}[5m])
```

#### Query 3: 95th Percentile

```promql
histogram_quantile(0.95, rate(react_component_render_duration_seconds_bucket[5m]))
```

#### Query 4: Total Renders per Second

```promql
rate(react_component_render_duration_seconds_count[5m])
```

### Langkah 8: Konfigurasi Panel Grafana

1. **Time Range**: Set ke "Last 1 hour" atau "Last 6 hours"
2. **Refresh**: Set ke "5s" atau "10s"
3. **Legend**: Set ke "Auto" atau custom format
4. **Unit**: Set ke "seconds" atau "milliseconds"

### Langkah 9: Debug Browser

1. Buka Developer Tools (F12)
2. Buka tab Console
3. Navigasi ke http://localhost:3000/users
4. Cek apakah ada error atau log dari hook
5. Buka tab Network
6. Cari request ke `/api/metrics/record`
7. Pastikan request berhasil (status 200)

### Langkah 10: Verifikasi Hook Implementation

Pastikan hook dipanggil dengan benar:

```typescript
// Di src/app/users/page.tsx
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";

export default function UsersPageComponent() {
  // Hook harus dipanggil di level teratas
  usePerformanceMonitor("UsersPage", "users");

  // ... rest of component
}
```

### Langkah 11: Test Manual Navigation

1. Buka browser
2. Login ke aplikasi (admin/admin123)
3. Navigasi ke halaman `/users`
4. Refresh halaman beberapa kali
5. Scroll dan interaksi dengan halaman
6. Cek apakah metrics terkirim

### Langkah 12: Cek Time Series Data

Jika masih tidak ada data, coba query ini di Prometheus:

```promql
# Cek semua metrics React
{__name__=~"react_component.*"}

# Cek metrics dengan label tertentu
{component_name="UsersPage"}

# Cek metrics dalam 1 jam terakhir
react_component_render_duration_seconds[1h]
```

### Langkah 13: Restart Services

Jika masih bermasalah, restart semua services:

```bash
# Stop aplikasi (Ctrl+C)
# Stop Prometheus (Ctrl+C)

# Start ulang Prometheus
prometheus --config.file=prometheus.yml

# Start ulang aplikasi
npm run dev
```

### Langkah 14: Verifikasi Final

Setelah semua langkah di atas:

1. **Prometheus**: http://localhost:9090 - Query `react_component_render_duration_seconds`
2. **Grafana**: Refresh dashboard dan cek panel
3. **Browser**: Navigasi ke `/users` dan cek network requests

### Troubleshooting Quick Fix

Jika masih tidak ada data, coba:

1. **Ganti query** di Grafana dengan query yang lebih sederhana:

   ```promql
   react_component_render_duration_seconds_sum
   ```

2. **Hapus filter labels** sementara untuk memastikan data ada

3. **Ganti time range** ke "Last 24 hours"

4. **Restart Grafana** jika menggunakan Grafana Cloud

### Expected Result

Setelah semua langkah di atas, panel Grafana seharusnya menampilkan:

- Garis grafik dengan data render time
- Legend yang menunjukkan component names
- Data yang berubah seiring waktu

Jika masih tidak ada data, kemungkinan ada masalah dengan:

- Konfigurasi Prometheus remote write
- Network connectivity ke Grafana Cloud
- Metrics tidak terkirim dengan benar
