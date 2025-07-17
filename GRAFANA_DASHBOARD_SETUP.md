# 📊 Grafana Dashboard Setup Guide

## Masalah: "No data" di Grafana Dashboard

Berdasarkan screenshot, masalahnya adalah:

- Data source sudah terpilih ✅
- Metric belum dipilih ❌
- Query belum dikonfigurasi ❌

## 🚀 Langkah-langkah Setup Dashboard

### Langkah 1: Verifikasi Data Source

1. **Buka Grafana Cloud** → Dashboards → Data Sources
2. **Cari data source** `grafanacloud-imamtaufiqherm-prom`
3. **Test connection** - pastikan status "Data source is working"

### Langkah 2: Buat Dashboard Baru

1. **Klik "New dashboard"**
2. **Klik "Add visualization"**
3. **Pilih data source** `grafanacloud-imamtaufiqherm-prom`

### Langkah 3: Konfigurasi Panel Pertama (HTTP Request Rate)

1. **Di Query Editor:**

   - **Metric**: Pilih `http_requests_total`
   - **Label filters**:
     - Label: `method` → Value: `GET`
     - Label: `route` → Value: `/api/users`
   - **Operations**:
     - Klik "+ Operations"
     - Pilih "Rate"
     - Set window: `5m`

2. **Query yang benar:**

   ```promql
   rate(http_requests_total{method="GET", route="/api/users"}[5m])
   ```

3. **Panel settings:**
   - **Title**: "HTTP Request Rate"
   - **Visualization**: Time series
   - **Legend**: `{{method}} {{route}}`

### Langkah 4: Panel Kedua (Response Time)

1. **Klik "Add panel"**
2. **Query:**
   ```promql
   histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{method="GET", route="/api/users"}[5m]))
   ```
3. **Title**: "95th Percentile Response Time"
4. **Unit**: seconds

### Langkah 5: Panel Ketiga (Database Query Duration)

1. **Klik "Add panel"**
2. **Query:**
   ```promql
   rate(database_query_duration_seconds_sum{query_type="users_query"}[5m]) / rate(database_query_duration_seconds_count{query_type="users_query"}[5m])
   ```
3. **Title**: "Database Query Duration"
4. **Unit**: seconds

### Langkah 6: Panel Keempat (Memory Usage)

1. **Klik "Add panel"**
2. **Query:**
   ```promql
   process_resident_memory_bytes
   ```
3. **Title**: "Memory Usage"
4. **Unit**: bytes
5. **Visualization**: Stat

### Langkah 7: Panel Kelima (CPU Usage)

1. **Klik "Add panel"**
2. **Query:**
   ```promql
   rate(process_cpu_seconds_total[5m])
   ```
3. **Title**: "CPU Usage"
4. **Unit**: short

## 🔍 Troubleshooting "No Data"

### Jika masih "No data":

1. **Cek time range:**

   - Pastikan time range sesuai (Last 1 hour/6 hours)
   - Coba "Last 15 minutes" untuk data terbaru

2. **Test query manual:**

   - Buka **Explore** di sidebar
   - Pilih data source `grafanacloud-imamtaufiqherm-prom`
   - Test query: `up`
   - Jika `up` tidak ada data, berarti Prometheus tidak terhubung

3. **Cek Prometheus:**

   ```bash
   # Test Prometheus lokal
   curl http://localhost:9090/api/v1/query?query=up

   # Test metrics endpoint
   curl http://localhost:3000/api/metrics
   ```

4. **Generate traffic:**
   ```bash
   node scripts/test-metrics.js
   ```

## 📋 Query Reference

### Basic Queries:

```promql
# Check if Prometheus is working
up

# All HTTP requests
http_requests_total

# HTTP request rate
rate(http_requests_total[5m])

# Response time
http_request_duration_seconds

# Database queries
database_query_duration_seconds

# System metrics
process_resident_memory_bytes
process_cpu_seconds_total
```

### Advanced Queries:

```promql
# Request rate by method
rate(http_requests_total[5m]) by (method)

# Request rate by route
rate(http_requests_total[5m]) by (route)

# 95th percentile response time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Average database query duration
rate(database_query_duration_seconds_sum[5m]) / rate(database_query_duration_seconds_count[5m])

# Memory usage in MB
process_resident_memory_bytes / 1024 / 1024

# CPU usage percentage
rate(process_cpu_seconds_total[5m]) * 100
```

## 🎯 Dashboard Layout

### Recommended Layout:

```
┌─────────────────┬─────────────────┐
│ HTTP Request    │ Response Time   │
│ Rate            │ (95th %ile)     │
├─────────────────┼─────────────────┤
│ Database Query  │ Memory Usage    │
│ Duration        │                 │
├─────────────────┼─────────────────┤
│ CPU Usage       │ Error Rate      │
│                 │                 │
└─────────────────┴─────────────────┘
```

## 🚨 Emergency Fixes

### Jika semua query return "No data":

1. **Restart Prometheus:**

   ```bash
   taskkill /F /IM prometheus.exe
   C:\prometheus\prometheus.exe --config.file=C:\prometheus\prometheus.yml
   ```

2. **Restart Next.js app:**

   ```bash
   npm run dev
   ```

3. **Generate test data:**

   ```bash
   node scripts/test-metrics.js
   ```

4. **Check Grafana Cloud credentials:**

   - Update `prometheus.yml` dengan credentials yang benar
   - Restart Prometheus setelah update

5. **Verify remote write:**
   - Buka http://localhost:9090/status
   - Cek section "Remote Write" status UP

## ✅ Success Indicators

Dashboard berhasil jika:

- [ ] Panel menampilkan grafik (bukan "No data")
- [ ] Data real-time (update setiap 15 detik)
- [ ] Metrics sesuai dengan traffic aplikasi
- [ ] Tidak ada error di console Grafana

## 📞 Support

Jika masih bermasalah:

1. Screenshot dari Explore mode dengan query `up`
2. Screenshot dari Prometheus UI (http://localhost:9090)
3. Output dari `node scripts/monitor-metrics.js`
4. Log error dari Grafana Cloud
