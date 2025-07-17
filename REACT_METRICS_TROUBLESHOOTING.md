# React Metrics Troubleshooting Guide

## Masalah: Panel "React Component Average Render Time" Tidak Menampilkan Data

### 1. Verifikasi Implementasi Hook

Pastikan hook `usePerformanceMonitor` sudah diimplementasikan dengan benar:

```typescript
// Di src/app/users/page.tsx
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";

export default function UsersPageComponent() {
  // Hook harus dipanggil di level teratas komponen
  usePerformanceMonitor("UsersPage", "users");

  // ... rest of component
}
```

### 2. Verifikasi Endpoint Metrics

Pastikan endpoint `/api/metrics/record` sudah ada dan berfungsi:

```bash
# Test endpoint secara manual
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

### 3. Verifikasi Metrics Definition

Pastikan metrics sudah didefinisikan dengan benar di `src/lib/metrics.ts`:

```typescript
export const reactComponentRenderTime = new Histogram({
  name: "react_component_render_duration_seconds",
  help: "React component render duration in seconds",
  labelNames: ["component_name", "page"],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10, 30, 60, 120, 300],
});
```

### 4. Test Metrics dengan Script

Jalankan script test untuk menghasilkan data:

```bash
# Install dependencies jika belum
npm install node-fetch@2

# Jalankan test script
node scripts/test-react-metrics-simple.js
```

### 5. Verifikasi Prometheus Targets

Pastikan Prometheus dapat mengakses metrics endpoint:

1. Buka http://localhost:9090
2. Klik "Status" > "Targets"
3. Pastikan target `update-profile` berstatus "UP"

### 6. Verifikasi Data di Prometheus

Cek apakah data metrics sudah masuk ke Prometheus:

1. Buka http://localhost:9090
2. Klik "Graph"
3. Masukkan query: `react_component_render_duration_seconds`
4. Klik "Execute"

### 7. Query PromQL yang Benar

Gunakan query PromQL yang tepat di Grafana:

#### Untuk Average Render Time:

```promql
rate(react_component_render_duration_seconds_sum[5m]) / rate(react_component_render_duration_seconds_count[5m])
```

#### Untuk 95th Percentile:

```promql
histogram_quantile(0.95, rate(react_component_render_duration_seconds_bucket[5m]))
```

#### Untuk Total Renders:

```promql
rate(react_component_render_duration_seconds_count[5m])
```

### 8. Filter Labels yang Benar

Pastikan filter labels sesuai dengan data yang dikirim:

```promql
# Untuk UsersPage component
rate(react_component_render_duration_seconds_sum{component_name="UsersPage", page="users"}[5m]) /
rate(react_component_render_duration_seconds_count{component_name="UsersPage", page="users"}[5m])

# Untuk UserCard component
rate(react_component_render_duration_seconds_sum{component_name="UserCard", page="users"}[5m]) /
rate(react_component_render_duration_seconds_count{component_name="UserCard", page="users"}[5m])
```

### 9. Debugging Steps

#### Step 1: Cek Browser Console

1. Buka Developer Tools di browser
2. Buka tab Console
3. Navigasi ke halaman `/users`
4. Cek apakah ada error atau log dari hook

#### Step 2: Cek Network Tab

1. Buka Developer Tools > Network
2. Navigasi ke halaman `/users`
3. Cari request ke `/api/metrics/record`
4. Pastikan request berhasil (status 200)

#### Step 3: Cek Metrics Endpoint

1. Buka http://localhost:3000/api/metrics
2. Cari metrics `react_component_render_duration_seconds`
3. Pastikan metrics ada dan memiliki data

### 10. Common Issues dan Solusi

#### Issue 1: Hook tidak dipanggil

**Solusi**: Pastikan hook dipanggil di level teratas komponen, bukan di dalam conditional atau loop.

#### Issue 2: Metrics tidak terkirim

**Solusi**: Cek apakah ada error CORS atau network. Pastikan aplikasi berjalan di localhost:3000.

#### Issue 3: Query PromQL salah

**Solusi**: Gunakan query yang tepat untuk histogram metrics. Jangan gunakan query untuk counter atau gauge.

#### Issue 4: Time range terlalu pendek

**Solusi**: Pastikan time range di Grafana cukup panjang (misal: Last 1 hour) untuk menangkap data.

#### Issue 5: Labels tidak match

**Solusi**: Pastikan labels di query sama dengan labels yang dikirim dari hook.

### 11. Test Manual

Jalankan test manual untuk memastikan semua komponen berfungsi:

```bash
# 1. Start aplikasi
npm run dev

# 2. Test metrics endpoint
curl -X POST http://localhost:3000/api/metrics/record \
  -H "Content-Type: application/json" \
  -d '{"metric":"react_component_render_duration_seconds","value":0.05,"labels":{"component_name":"TestComponent","page":"test"}}'

# 3. Cek metrics
curl http://localhost:3000/api/metrics | grep react_component_render_duration_seconds

# 4. Cek Prometheus
curl http://localhost:9090/api/v1/query?query=react_component_render_duration_seconds
```

### 12. Monitoring Checklist

- [ ] Hook `usePerformanceMonitor` diimplementasikan
- [ ] Endpoint `/api/metrics/record` berfungsi
- [ ] Metrics didefinisikan dengan benar
- [ ] Prometheus target UP
- [ ] Data metrics masuk ke Prometheus
- [ ] Query PromQL benar
- [ ] Time range Grafana sesuai
- [ ] Labels filter sesuai

Jika semua checklist sudah terpenuhi tapi data masih tidak muncul, coba refresh dashboard atau tunggu beberapa menit untuk data terpropagasi.
