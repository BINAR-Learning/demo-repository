# 📊 Grafana Queries Reference

## 🎯 API Performance Queries

### API 95th Percentile Response Time

```promql
histogram_quantile(0.95, rate(api_response_duration_seconds_bucket{endpoint_type="api"}[5m]))
```

### API Average Response Time

```promql
rate(api_response_duration_seconds_sum{endpoint_type="api"}[5m]) / rate(api_response_duration_seconds_count{endpoint_type="api"}[5m])
```

### API Request Rate

```promql
rate(api_requests_total{endpoint_type="api"}[5m])
```

### Specific API Endpoint (e.g., /api/users)

```promql
# 95th percentile
histogram_quantile(0.95, rate(api_response_duration_seconds_bucket{route="/api/users"}[5m]))

# Average
rate(api_response_duration_seconds_sum{route="/api/users"}[5m]) / rate(api_response_duration_seconds_count{route="/api/users"}[5m])

# Request rate
rate(api_requests_total{route="/api/users"}[5m])
```

## ⚛️ React Component Performance Queries

### React Component 95th Percentile Render Time

```promql
histogram_quantile(0.95, rate(react_component_render_duration_seconds_bucket[5m]))
```

### React Component Average Render Time

```promql
rate(react_component_render_duration_seconds_sum[5m]) / rate(react_component_render_duration_seconds_count[5m])
```

### Component Render Rate

```promql
rate(react_component_render_duration_seconds_count[5m])
```

### Specific Component (e.g., UserList)

```promql
# 95th percentile
histogram_quantile(0.95, rate(react_component_render_duration_seconds_bucket{component_name="UserList"}[5m]))

# Average
rate(react_component_render_duration_seconds_sum{component_name="UserList"}[5m]) / rate(react_component_render_duration_seconds_count{component_name="UserList"}[5m])

# Render rate
rate(react_component_render_duration_seconds_count{component_name="UserList"}[5m])
```

## 🔍 Error Monitoring Queries

### API Error Rate

```promql
rate(api_requests_total{status_code=~"5.."}[5m])
```

### API Success Rate

```promql
rate(api_requests_total{status_code=~"2.."}[5m])
```

### API Error Percentage

```promql
(rate(api_requests_total{status_code=~"5.."}[5m]) / rate(api_requests_total[5m])) * 100
```

## 📈 System Performance Queries

### Memory Usage (MB)

```promql
process_resident_memory_bytes / 1024 / 1024
```

### CPU Usage

```promql
rate(process_cpu_seconds_total[5m])
```

### Database Query Duration

```promql
# 95th percentile
histogram_quantile(0.95, rate(database_query_duration_seconds_bucket{query_type="users_query"}[5m]))

# Average
rate(database_query_duration_seconds_sum{query_type="users_query"}[5m]) / rate(database_query_duration_seconds_count{query_type="users_query"}[5m])
```

## 🎨 Panel Configuration

### Time Series Panel Settings

- **Visualization**: Time series
- **Y-axis Label**: "Response Time (seconds)" / "Render Time (seconds)"
- **Unit**: seconds
- **Legend**: `{{method}} {{route}}` / `{{component_name}} ({{page}})`

### Stat Panel Settings

- **Visualization**: Stat
- **Unit**: seconds / reqps / renders/s
- **Decimals**: 2

## 🚨 Alert Queries

### API Response Time Alert (> 5 seconds)

```promql
histogram_quantile(0.95, rate(api_response_duration_seconds_bucket{endpoint_type="api"}[5m])) > 5
```

### React Render Time Alert (> 1 second)

```promql
histogram_quantile(0.95, rate(react_component_render_duration_seconds_bucket[5m])) > 1
```

### High Error Rate Alert (> 5%)

```promql
(rate(api_requests_total{status_code=~"5.."}[5m]) / rate(api_requests_total[5m])) * 100 > 5
```

## 🔧 Troubleshooting Queries

### Check if metrics exist

```promql
# API metrics
api_response_duration_seconds

# React metrics
react_component_render_duration_seconds

# All metrics with specific labels
{endpoint_type="api"}
{component_name="UserList"}
```

### Check metric buckets

```promql
# See all buckets for API response time
api_response_duration_seconds_bucket{route="/api/users"}

# See all buckets for React render time
react_component_render_duration_seconds_bucket{component_name="UserList"}
```

### Check raw values

```promql
# Total API requests
api_requests_total

# Total component renders
react_component_render_duration_seconds_count
```

## 📊 Dashboard Layout Example

```
┌─────────────────┬─────────────────┐
│ API 95th %ile   │ API Avg Time    │
│ Response Time   │                 │
├─────────────────┼─────────────────┤
│ React 95th %ile │ React Avg Time  │
│ Render Time     │                 │
├─────────────────┼─────────────────┤
│ API Request     │ Component       │
│ Rate            │ Render Rate     │
├─────────────────┼─────────────────┤
│ Memory Usage    │ CPU Usage       │
│                 │                 │
└─────────────────┴─────────────────┘
```

## ✅ Quick Setup Checklist

- [ ] Add queries to Grafana panels
- [ ] Set appropriate time ranges (Last 1 hour/6 hours)
- [ ] Configure refresh intervals (15s)
- [ ] Set up alerts for performance thresholds
- [ ] Test with real data using `node scripts/test-performance.js`
- [ ] Verify metrics appear in Prometheus
- [ ] Check Grafana dashboard for data visualization
