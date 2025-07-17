# Perbaikan Dashboard Grafana

## Masalah yang Ditemukan:

### 1. Panel Duplikat

- **Top-Right**: "95th Percentile Response Time"
- **Bottom-Right**: "API 95th Percentile Response Time"
- Kedua panel menampilkan data yang sama untuk `/api/users`

### 2. React Metrics Terbatas

- React component metrics hanya muncul di akhir grafik
- Data tidak konsisten sepanjang waktu

## Solusi:

### Langkah 1: Hapus Panel Duplikat

**Hapus salah satu panel "95th Percentile Response Time":**

1. Buka dashboard di Grafana
2. Klik panel **Bottom-Right** "API 95th Percentile Response Time"
3. Klik tombol **"More"** (3 titik) di pojok kanan atas panel
4. Pilih **"Delete"**
5. Konfirmasi penghapusan

### Langkah 2: Perbaiki Panel React Metrics

**Untuk panel "React Component Average Render Time":**

1. Klik panel untuk edit
2. **Query A** - Ganti dengan query yang lebih robust:

   ```promql
   # Query untuk semua React components
   rate(react_component_render_duration_seconds_sum[5m]) / rate(react_component_render_duration_seconds_count[5m])
   ```

3. **Tambahkan Query B** untuk data yang lebih detail:

   ```promql
   # Query untuk UsersPage component
   rate(react_component_render_duration_seconds_sum{component_name="UsersPage"}[5m]) / rate(react_component_render_duration_seconds_count{component_name="UsersPage"}[5m])
   ```

4. **Tambahkan Query C**:
   ```promql
   # Query untuk UserCard component
   rate(react_component_render_duration_seconds_sum{component_name="UserCard"}[5m]) / rate(react_component_render_duration_seconds_count{component_name="UserCard"}[5m])
   ```

### Langkah 3: Tambahkan Panel Baru

**Tambahkan panel "React Component Render Count":**

1. Klik **"Add panel"**
2. **Query A**:

   ```promql
   # Total renders per second untuk semua components
   rate(react_component_render_duration_seconds_count[5m])
   ```

3. **Query B**:

   ```promql
   # Renders per second untuk UsersPage
   rate(react_component_render_duration_seconds_count{component_name="UsersPage"}[5m])
   ```

4. **Query C**:

   ```promql
   # Renders per second untuk UserCard
   rate(react_component_render_duration_seconds_count{component_name="UserCard"}[5m])
   ```

5. **Panel Options**:
   - **Title**: "React Component Render Count"
   - **Unit**: "short" (renders/sec)
   - **Legend**: "Auto"

### Langkah 4: Tambahkan Panel React 95th Percentile

**Tambahkan panel "React Component 95th Percentile":**

1. Klik **"Add panel"**
2. **Query A**:

   ```promql
   # 95th percentile untuk semua React components
   histogram_quantile(0.95, rate(react_component_render_duration_seconds_bucket[5m]))
   ```

3. **Query B**:

   ```promql
   # 95th percentile untuk UsersPage
   histogram_quantile(0.95, rate(react_component_render_duration_seconds_bucket{component_name="UsersPage"}[5m]))
   ```

4. **Query C**:

   ```promql
   # 95th percentile untuk UserCard
   histogram_quantile(0.95, rate(react_component_render_duration_seconds_bucket{component_name="UserCard"}[5m]))
   ```

5. **Panel Options**:
   - **Title**: "React Component 95th Percentile"
   - **Unit**: "s" (seconds)
   - **Legend**: "Auto"

### Langkah 5: Perbaiki Konfigurasi Panel

**Untuk semua panel React:**

1. **Time Range**: Set ke "Last 1 hour" atau "Last 6 hours"
2. **Refresh**: Set ke "10s" untuk update lebih sering
3. **Legend**: Format legend untuk lebih jelas
4. **Tooltip**: Set ke "All" untuk melihat semua series

### Langkah 6: Generate Lebih Banyak Data React

Jalankan script untuk generate lebih banyak data React:

```bash
# Jalankan script test yang lebih intensif
node scripts/full-react-metrics-test.js

# Atau jalankan script sederhana beberapa kali
for i in {1..5}; do
  node scripts/test-react-metrics-simple.js
  sleep 30
done
```

### Langkah 7: Verifikasi Dashboard

Setelah perbaikan, dashboard seharusnya memiliki:

1. **Top-Left**: React Component Average Render Time
2. **Top-Right**: 95th Percentile Response Time (API)
3. **Bottom-Left**: API Average Response Time
4. **Bottom-Right**: React Component Render Count (baru)
5. **Additional**: React Component 95th Percentile (baru)

### Langkah 8: Monitoring Checklist

- [ ] Panel duplikat sudah dihapus
- [ ] React metrics muncul konsisten
- [ ] Data terupdate setiap 10 detik
- [ ] Legend menampilkan component names dengan jelas
- [ ] Time range sesuai (1-6 jam)
- [ ] Tidak ada panel kosong

### Expected Result

Setelah perbaikan:

- Tidak ada panel duplikat
- React metrics muncul konsisten sepanjang waktu
- Dashboard lebih informatif dengan panel tambahan
- Data terupdate secara real-time
