# Prometheus & Grafana Setup Guide

## Masalah: Metrics berhasil dikirim tapi tidak muncul di Grafana

### Langkah 1: Setup Prometheus

1. **Download Prometheus**

   ```bash
   # Download dari https://prometheus.io/download/
   # Extract ke folder, misalnya C:\prometheus
   ```

2. **Buat file prometheus.yml**

   ```yaml
   global:
     scrape_interval: 15s
     evaluation_interval: 15s

   scrape_configs:
     - job_name: "prometheus"
       static_configs:
         - targets: ["localhost:9090"]

     - job_name: "nextjs-app"
       metrics_path: /api/metrics
       static_configs:
         - targets: ["localhost:3000"]
       scrape_interval: 15s
       scrape_timeout: 10s

   # Remote write untuk Grafana Cloud
   remote_write:
     - url: https://prometheus-blocks-prod-us-central1.grafana.net/api/prom/push
       basic_auth:
         username: YOUR_INSTANCE_ID # Ganti dengan Instance ID dari Grafana Cloud
         password: YOUR_API_KEY # Ganti dengan API Key dari Grafana Cloud
       remote_write_relabel_configs:
         - source_labels: [__name__]
           regex: ".*"
           action: keep
   ```

3. **Jalankan Prometheus**
   ```bash
   cd C:\prometheus
   prometheus.exe --config.file=prometheus.yml
   ```

### Langkah 2: Setup Grafana Cloud

1. **Buat akun Grafana Cloud** di https://grafana.com/
2. **Dapatkan credentials**:

   - Buka Grafana Cloud Dashboard
   - Pilih Stack → Connections → Prometheus → Remote Write
   - Copy Instance ID dan API Key

3. **Update prometheus.yml** dengan credentials yang benar

### Langkah 3: Verifikasi Metrics

1. **Cek Prometheus UI** (http://localhost:9090):

   - Status → Targets → pastikan nextjs-app UP
   - Graph → cari metrics seperti `http_requests_total`

2. **Cek Remote Write**:
   - Status → Configuration → Remote Write
   - Pastikan status "UP"

### Langkah 4: Buat Dashboard di Grafana

1. **Buka Grafana Cloud** → Dashboards → New Dashboard
2. **Tambah Panel** dengan query berikut:

#### Panel 1: HTTP Request Rate

```
rate(http_requests_total[5m])
```

#### Panel 2: HTTP Request Duration (95th percentile)

```
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

#### Panel 3: Database Query Duration

```
rate(database_query_duration_seconds_sum[5m]) / rate(database_query_duration_seconds_count[5m])
```

#### Panel 4: Memory Usage

```
process_resident_memory_bytes
```

#### Panel 5: CPU Usage

```
rate(process_cpu_seconds_total[5m])
```

### Langkah 5: Troubleshooting

#### Jika metrics tidak muncul:

1. **Cek Prometheus targets**:

   - Buka http://localhost:9090/targets
   - Pastikan nextjs-app status UP

2. **Cek metrics endpoint**:

   - Buka http://localhost:3000/api/metrics
   - Pastikan mengembalikan metrics dalam format Prometheus

3. **Cek remote write logs**:

   - Lihat console Prometheus untuk error messages
   - Pastikan credentials Grafana Cloud benar

4. **Cek Grafana Cloud**:
   - Buka Grafana Cloud → Explore
   - Pilih Prometheus data source
   - Test query: `up`

#### Jika masih bermasalah:

1. **Restart Prometheus** setelah update config
2. **Clear browser cache** untuk Grafana
3. **Check firewall** - pastikan port 9090 tidak diblokir
4. **Verify timezone** - pastikan timezone konsisten

### Langkah 6: Monitoring Script

Buat script untuk monitoring otomatis:

```javascript
// scripts/monitor-metrics.js
const axios = require("axios");

async function checkMetrics() {
  try {
    // Check Next.js metrics
    const metrics = await axios.get("http://localhost:3000/api/metrics");
    console.log("✅ Next.js metrics endpoint OK");

    // Check Prometheus targets
    const targets = await axios.get("http://localhost:9090/api/v1/targets");
    const nextjsTarget = targets.data.data.activeTargets.find(
      (t) => t.labels.job === "nextjs-app"
    );

    if (nextjsTarget && nextjsTarget.health === "up") {
      console.log("✅ Prometheus target UP");
    } else {
      console.log("❌ Prometheus target DOWN");
    }
  } catch (error) {
    console.error("❌ Error checking metrics:", error.message);
  }
}

// Run every 30 seconds
setInterval(checkMetrics, 30000);
checkMetrics();
```

### Langkah 7: Otomatisasi Setup

Buat script untuk setup otomatis:

```bash
# scripts/setup-monitoring.bat
@echo off
echo Setting up Prometheus and Grafana monitoring...

REM Download Prometheus if not exists
if not exist "C:\prometheus\prometheus.exe" (
    echo Downloading Prometheus...
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/prometheus/prometheus/releases/download/v2.45.0/prometheus-2.45.0.windows-amd64.zip' -OutFile 'prometheus.zip'"
    powershell -Command "Expand-Archive -Path 'prometheus.zip' -DestinationPath 'C:\'"
    move "C:\prometheus-2.45.0.windows-amd64\*" "C:\prometheus\"
    rmdir "C:\prometheus-2.45.0.windows-amd64"
    del prometheus.zip
)

REM Copy config
copy prometheus.yml C:\prometheus\prometheus.yml

REM Start Prometheus
echo Starting Prometheus...
start "Prometheus" C:\prometheus\prometheus.exe --config.file=C:\prometheus\prometheus.yml

echo Setup complete! Check http://localhost:9090
```

### Troubleshooting Checklist:

- [ ] Prometheus berjalan di port 9090
- [ ] Next.js app berjalan di port 3000
- [ ] Metrics endpoint `/api/metrics` accessible
- [ ] Prometheus target status UP
- [ ] Grafana Cloud credentials benar
- [ ] Remote write status UP
- [ ] Dashboard query menggunakan data source yang benar
- [ ] Time range di Grafana sesuai (last 1 hour/6 hours)
- [ ] Metrics memiliki data (tidak kosong)

### Metrics yang Harus Muncul:

1. `http_requests_total` - Total HTTP requests
2. `http_request_duration_seconds` - Request duration
3. `database_query_duration_seconds` - Database query time
4. `process_resident_memory_bytes` - Memory usage
5. `process_cpu_seconds_total` - CPU usage
6. `active_users_total` - Active users count
