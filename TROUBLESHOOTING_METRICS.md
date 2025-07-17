# 🔧 Troubleshooting Metrics & Grafana Issues

## Masalah: Metrics berhasil dikirim ke Prometheus tapi tidak muncul di Grafana

### 🚨 Langkah Diagnosa Cepat

1. **Jalankan script monitoring**:

   ```bash
   node scripts/monitor-metrics.js
   ```

2. **Jalankan script test**:

   ```bash
   node scripts/test-metrics.js
   ```

3. **Setup otomatis**:
   ```bash
   scripts/setup-monitoring.bat
   ```

### 📋 Checklist Diagnosa

#### ✅ Langkah 1: Verifikasi Next.js App

- [ ] App berjalan di port 3000
- [ ] Endpoint `/api/metrics` accessible
- [ ] Metrics dalam format Prometheus yang benar
- [ ] Tidak ada error di console

#### ✅ Langkah 2: Verifikasi Prometheus

- [ ] Prometheus berjalan di port 9090
- [ ] Target `nextjs-app` status UP
- [ ] Metrics muncul di Prometheus UI
- [ ] Konfigurasi `prometheus.yml` benar

#### ✅ Langkah 3: Verifikasi Grafana Cloud

- [ ] Credentials Grafana Cloud benar
- [ ] Remote write status UP
- [ ] Data source Prometheus terkonfigurasi
- [ ] Dashboard menggunakan data source yang benar

### 🔍 Diagnosa Detail

#### 1. Cek Metrics Endpoint

```bash
curl http://localhost:3000/api/metrics
```

**Expected output:**

```
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",route="/",status="200"} 10
```

#### 2. Cek Prometheus Targets

Buka http://localhost:9090/targets

- Status harus "UP"
- Last scrape harus recent
- Last error harus kosong

#### 3. Cek Prometheus Metrics

Buka http://localhost:9090/graph
Query: `http_requests_total`

- Harus ada data
- Values harus bertambah

#### 4. Cek Remote Write

Buka http://localhost:9090/status

- Cari section "Remote Write"
- Status harus "UP"
- Tidak ada error

#### 5. Cek Grafana Cloud

1. Buka Grafana Cloud Dashboard
2. Explore → Prometheus data source
3. Query: `up`
4. Query: `http_requests_total`

### 🛠️ Solusi Masalah Umum

#### Masalah 1: Prometheus Target DOWN

**Gejala:** Target status "DOWN" di http://localhost:9090/targets

**Solusi:**

1. Pastikan Next.js app berjalan:

   ```bash
   npm run dev
   ```

2. Test metrics endpoint:

   ```bash
   curl http://localhost:3000/api/metrics
   ```

3. Cek firewall/antivirus tidak memblokir port 3000

4. Restart Prometheus:

   ```bash
   # Stop Prometheus
   taskkill /F /IM prometheus.exe

   # Start ulang
   C:\prometheus\prometheus.exe --config.file=C:\prometheus\prometheus.yml
   ```

#### Masalah 2: Remote Write Gagal

**Gejala:** Error di log Prometheus tentang remote write

**Solusi:**

1. Update credentials di `prometheus.yml`:

   ```yaml
   remote_write:
     - url: https://prometheus-blocks-prod-us-central1.grafana.net/api/prom/push
       basic_auth:
         username: YOUR_ACTUAL_INSTANCE_ID
         password: YOUR_ACTUAL_API_KEY
   ```

2. Dapatkan credentials dari Grafana Cloud:

   - Login ke Grafana Cloud
   - Stack → Connections → Prometheus → Remote Write
   - Copy Instance ID dan API Key

3. Restart Prometheus setelah update config

#### Masalah 3: Data Tidak Muncul di Grafana

**Gejala:** Metrics ada di Prometheus tapi tidak di Grafana

**Solusi:**

1. Cek data source di Grafana:

   - Dashboards → Data Sources
   - Pastikan Prometheus data source terkonfigurasi
   - Test connection

2. Cek time range:

   - Pastikan time range di Grafana sesuai
   - Coba "Last 1 hour" atau "Last 6 hours"

3. Cek query:

   - Pastikan query menggunakan metric yang benar
   - Test query di Explore mode

4. Cek remote write status:
   - Buka http://localhost:9090/status
   - Pastikan remote write UP

#### Masalah 4: Metrics Kosong

**Gejala:** Tidak ada data di metrics endpoint

**Solusi:**

1. Generate traffic:

   ```bash
   node scripts/test-metrics.js
   ```

2. Cek middleware metrics:

   - Pastikan `metrics-middleware.ts` terpasang
   - Cek tidak ada error di console

3. Restart aplikasi:
   ```bash
   npm run dev
   ```

### 🔧 Script Troubleshooting

#### Script 1: Quick Check

```bash
node scripts/monitor-metrics.js
```

#### Script 2: Generate Test Data

```bash
node scripts/test-metrics.js
```

#### Script 3: Setup Otomatis

```bash
scripts/setup-monitoring.bat
```

### 📊 Metrics yang Harus Ada

1. **HTTP Metrics:**

   - `http_requests_total` - Total requests
   - `http_request_duration_seconds` - Request duration

2. **System Metrics:**

   - `process_resident_memory_bytes` - Memory usage
   - `process_cpu_seconds_total` - CPU usage

3. **Custom Metrics:**
   - `database_query_duration_seconds` - DB query time
   - `active_users_total` - Active users

### 🎯 Query Grafana yang Benar

#### Panel 1: Request Rate

```
rate(http_requests_total[5m])
```

#### Panel 2: Response Time (95th percentile)

```
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

#### Panel 3: Memory Usage

```
process_resident_memory_bytes
```

#### Panel 4: CPU Usage

```
rate(process_cpu_seconds_total[5m])
```

### 🚨 Emergency Fixes

#### Jika semua gagal:

1. **Reset lengkap:**

   ```bash
   # Stop semua service
   taskkill /F /IM prometheus.exe
   taskkill /F /IM node.exe

   # Restart dari awal
   npm run dev
   scripts/setup-monitoring.bat
   ```

2. **Cek log error:**

   - Next.js console untuk error app
   - Prometheus console untuk error scraping
   - Grafana Cloud untuk error connection

3. **Test manual:**

   ```bash
   # Test metrics endpoint
   curl http://localhost:3000/api/metrics

   # Test Prometheus
   curl http://localhost:9090/api/v1/targets
   ```

### 📞 Support

Jika masih bermasalah:

1. Cek log error lengkap
2. Screenshot dari Prometheus UI
3. Screenshot dari Grafana Cloud
4. Output dari script monitoring

### 🎉 Success Indicators

✅ **Berhasil jika:**

- Prometheus target UP
- Remote write UP
- Data muncul di Grafana
- Dashboard menampilkan metrics real-time
- Tidak ada error di log

❌ **Masih bermasalah jika:**

- Target DOWN
- Remote write error
- Data kosong di Grafana
- Error di console/log
