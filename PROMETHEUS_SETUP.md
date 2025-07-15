# 🚀 Prometheus & Grafana Cloud Setup

Panduan lengkap untuk menghubungkan aplikasi Next.js dengan Prometheus lokal dan Grafana Cloud menggunakan remote write.

## 📋 Prerequisites

1. **Node.js & npm** - untuk menjalankan aplikasi
2. **Prometheus** - untuk scraping metrics lokal
3. **Grafana Cloud Account** - untuk monitoring dan dashboard

## 🔧 Setup Aplikasi

### 1. Install Dependencies
```bash
npm install
```

### 2. Jalankan Aplikasi
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000` dengan endpoint metrics di `/api/metrics`.

## 📊 Metrics yang Tersedia

### HTTP Metrics
- `http_requests_total` - Total HTTP requests
- `http_request_duration_seconds` - Request duration

### Database Metrics
- `database_query_duration_seconds` - Query execution time

### JWT Metrics
- `jwt_token_generation_duration_seconds` - Token generation time

### System Metrics
- `process_cpu_seconds_total` - CPU usage
- `process_resident_memory_bytes` - Memory usage
- `nodejs_heap_size_total_bytes` - Heap size

## 🔧 Setup Prometheus Lokal

### 1. Download Prometheus
- Download dari: https://prometheus.io/download/
- Pilih sesuai OS kamu (Windows, Linux, Mac)
- Ekstrak ke folder, misal: `C:\prometheus`

### 2. Konfigurasi Prometheus
Buat file `prometheus.yml` di folder Prometheus:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'nextjs-app'
    metrics_path: /api/metrics
    static_configs:
      - targets: ['localhost:3000']

remote_write:
  - url: https://prometheus-blocks-prod-us-central1.grafana.net/api/prom/push
    basic_auth:
      username: <instance_id>
      password: <api_key>
```

**Ganti `<instance_id>` dan `<api_key>` dengan data dari Grafana Cloud:**
1. Login ke Grafana Cloud
2. Buka **Connections** → **Prometheus** → **Prometheus remote write**
3. Copy URL, username (instance id), dan API key

### 3. Jalankan Prometheus
```bash
cd C:\prometheus
prometheus.exe --config.file=prometheus.yml
```

### 4. Verifikasi Prometheus
- Buka browser ke: http://localhost:9090
- Cek menu **Status** → **Targets**
- Pastikan `nextjs-app` statusnya **UP**

## 🔗 Setup Grafana Cloud

### 1. Login ke Grafana Cloud
- Buka https://grafana.com/
- Login ke account kamu

### 2. Cek Data Source
- Buka **Connections** → **Data Sources**
- Cari data source Prometheus kamu
- Klik **Test** untuk memastikan koneksi OK

### 3. Buat Dashboard
1. Klik **Dashboards** di sidebar
2. Klik **New** → **New Dashboard**
3. Klik **Add visualization**

## 📈 Contoh Dashboard Queries

### Request Rate
```
rate(http_requests_total[5m])
```

### 95th Percentile Response Time
```
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

### Database Query Duration
```
rate(database_query_duration_seconds_sum[5m]) / rate(database_query_duration_seconds_count[5m])
```

### Memory Usage
```
process_resident_memory_bytes
```

### CPU Usage
```
rate(process_cpu_seconds_total[5m])
```

## 🎯 Dashboard Panel Types

### Graph Panel
- Untuk time series data
- Contoh: Request rate, response time

### Stat Panel
- Untuk single value
- Contoh: Total requests, memory usage

### Table Panel
- Untuk detailed metrics
- Contoh: Top endpoints, error rates

## 🔍 Troubleshooting

### Prometheus Target DOWN
1. Pastikan aplikasi Next.js berjalan di port 3000
2. Cek endpoint `/api/metrics` di browser
3. Pastikan `metrics_path: /api/metrics` ada di config

### Data Tidak Muncul di Grafana Cloud
1. Cek log Prometheus untuk error remote write
2. Pastikan API key dan instance ID benar
3. Cek firewall/antivirus tidak memblokir koneksi keluar

### Metrics Endpoint Error
1. Pastikan aplikasi berjalan dengan benar
2. Cek console untuk error Edge Runtime
3. Restart aplikasi jika perlu

## 📝 Architecture

```
Next.js App (localhost:3000)
    ↓ /api/metrics
Prometheus Local (localhost:9090)
    ↓ remote_write
Grafana Cloud
```

## 🎉 Keuntungan Setup Ini

✅ **Lebih reliable** - tidak ada masalah URL berubah  
✅ **Lebih aman** - tidak expose endpoint ke internet  
✅ **Lebih cepat** - koneksi lokal  
✅ **Lebih sederhana** - tidak perlu ngrok  
✅ **Real-time monitoring** - data langsung masuk ke Grafana Cloud  

## 🚀 Next Steps

1. **Setup Alerting** - Buat alert untuk threshold tertentu
2. **Custom Dashboard** - Buat dashboard sesuai kebutuhan
3. **Performance Optimization** - Monitor dan optimize berdasarkan metrics
4. **Log Integration** - Tambahkan log monitoring dengan Loki

## 📚 Referensi

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Cloud Documentation](https://grafana.com/docs/grafana-cloud/)
- [Prometheus Remote Write](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#remote_write)
- [Grafana Cloud Remote Write](https://grafana.com/docs/grafana-cloud/monitor-infrastructure/prometheus/remote-write/) 