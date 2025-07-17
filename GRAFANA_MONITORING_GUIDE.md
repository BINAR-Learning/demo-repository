# 📊 Grafana Monitoring Guide: API & React Component Performance

## 🎯 Overview

This guide will help you set up comprehensive monitoring for:

- **API Endpoint Execution Time** (95th percentile & average)
- **React Component Render Time** (95th percentile & average)
- **Real-time performance metrics** with Grafana dashboards

## 📋 Prerequisites

- ✅ Next.js application running
- ✅ Prometheus configured and running
- ✅ Grafana Cloud account
- ✅ Metrics endpoint working (`/api/metrics`)

## 🚀 Step 1: Configure Prometheus Metrics

### 1.1 Update Metrics Configuration

First, let's add React component render time metrics to our existing metrics:

```typescript
// src/lib/metrics.ts
import {
  register,
  collectDefaultMetrics,
  Counter,
  Histogram,
  Gauge,
} from "prom-client";

// Existing metrics...

// New: React Component Render Time
export const reactComponentRenderTime = new Histogram({
  name: "react_component_render_duration_seconds",
  help: "React component render duration in seconds",
  labelNames: ["component_name", "page"],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10, 30, 60, 120, 300],
});

// Enhanced: API Response Time (with more detailed labels)
export const apiResponseTime = new Histogram({
  name: "api_response_duration_seconds",
  help: "API endpoint response duration in seconds",
  labelNames: ["method", "route", "status_code", "endpoint_type"],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60, 120, 300],
});

// New: API Request Counter (enhanced)
export const apiRequestsTotal = new Counter({
  name: "api_requests_total",
  help: "Total number of API requests",
  labelNames: ["method", "route", "status_code", "endpoint_type"],
});
```

### 1.2 Create React Performance Hook

```typescript
// src/hooks/usePerformanceMonitor.ts
import { useEffect, useRef } from "react";
import { reactComponentRenderTime } from "@/lib/metrics";

export function usePerformanceMonitor(componentName: string, pageName: string) {
  const renderStartTime = useRef<number>(0);

  useEffect(() => {
    // Record render start time
    renderStartTime.current = performance.now();

    return () => {
      // Record render end time when component unmounts
      const renderDuration =
        (performance.now() - renderStartTime.current) / 1000;

      // Send metric to backend
      fetch("/api/metrics/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metric: "react_component_render_duration_seconds",
          value: renderDuration,
          labels: {
            component_name: componentName,
            page: pageName,
          },
        }),
      }).catch(console.error);
    };
  }, [componentName, pageName]);
}
```

### 1.3 Create Metrics Recording API

```typescript
// src/app/api/metrics/record/route.ts
import { NextResponse } from "next/server";
import {
  reactComponentRenderTime,
  apiResponseTime,
  apiRequestsTotal,
} from "@/lib/metrics";

export async function POST(request: Request) {
  try {
    const { metric, value, labels } = await request.json();

    switch (metric) {
      case "react_component_render_duration_seconds":
        reactComponentRenderTime.observe(labels, value);
        break;
      case "api_response_duration_seconds":
        apiResponseTime.observe(labels, value);
        break;
      case "api_requests_total":
        apiRequestsTotal.inc(labels);
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error recording metric:", error);
    return NextResponse.json(
      { error: "Failed to record metric" },
      { status: 500 }
    );
  }
}
```

### 1.4 Enhanced API Middleware

```typescript
// src/lib/api-metrics-middleware.ts
import { apiResponseTime, apiRequestsTotal } from "./metrics";

export function withApiMetrics(handler: Function) {
  return async (request: Request) => {
    const start = Date.now();
    const method = request.method;
    const url = new URL(request.url);
    const route = url.pathname;

    try {
      const response = await handler(request);

      // Record metrics
      const duration = (Date.now() - start) / 1000;
      const statusCode = response.status.toString();
      const endpointType = route.startsWith("/api/") ? "api" : "page";

      apiResponseTime.observe(
        {
          method,
          route,
          status_code: statusCode,
          endpoint_type: endpointType,
        },
        duration
      );

      apiRequestsTotal.inc({
        method,
        route,
        status_code: statusCode,
        endpoint_type: endpointType,
      });

      return response;
    } catch (error) {
      const duration = (Date.now() - start) / 1000;

      apiResponseTime.observe(
        {
          method,
          route,
          status_code: "500",
          endpoint_type: "api",
        },
        duration
      );

      apiRequestsTotal.inc({
        method,
        route,
        status_code: "500",
        endpoint_type: "api",
      });

      throw error;
    }
  };
}
```

## 🎨 Step 2: Implement in React Components

### 2.1 Use Performance Monitor in Components

```tsx
// src/components/UserProfile.tsx
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";

export function UserProfile({ user }: { user: User }) {
  usePerformanceMonitor("UserProfile", "profile");

  return (
    <div className="user-profile">
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      {/* Component content */}
    </div>
  );
}
```

```tsx
// src/components/UserList.tsx
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";

export function UserList({ users }: { users: User[] }) {
  usePerformanceMonitor("UserList", "users");

  return (
    <div className="user-list">
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

## 📊 Step 3: Configure Prometheus

### 3.1 Update prometheus.yml

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: "nextjs-app"
    metrics_path: /api/metrics
    static_configs:
      - targets: ["localhost:3000"]
    scrape_interval: 15s
    scrape_timeout: 10s

remote_write:
  - url: https://prometheus-blocks-prod-us-central1.grafana.net/api/prom/push
    basic_auth:
      username: YOUR_INSTANCE_ID
      password: YOUR_API_KEY
```

## 🎯 Step 4: Create Grafana Dashboard

### 4.1 Dashboard Setup

1. **Open Grafana Cloud** → Dashboards
2. **Click "New dashboard"**
3. **Click "Add visualization"**
4. **Select data source**: `grafanacloud-your-prom`

### 4.2 Panel 1: API 95th Percentile Response Time

**Query:**

```promql
histogram_quantile(0.95, rate(api_response_duration_seconds_bucket{endpoint_type="api"}[5m]))
```

**Settings:**

- **Title**: "API 95th Percentile Response Time"
- **Visualization**: Time series
- **Y-axis Label**: "Response Time (seconds)"
- **Unit**: seconds
- **Legend**: `{{method}} {{route}}`

### 4.3 Panel 2: API Average Response Time

**Query:**

```promql
rate(api_response_duration_seconds_sum{endpoint_type="api"}[5m]) / rate(api_response_duration_seconds_count{endpoint_type="api"}[5m])
```

**Settings:**

- **Title**: "API Average Response Time"
- **Visualization**: Time series
- **Y-axis Label**: "Response Time (seconds)"
- **Unit**: seconds
- **Legend**: `{{method}} {{route}}`

### 4.4 Panel 3: React Component 95th Percentile Render Time

**Query:**

```promql
histogram_quantile(0.95, rate(react_component_render_duration_seconds_bucket[5m]))
```

**Settings:**

- **Title**: "React Component 95th Percentile Render Time"
- **Visualization**: Time series
- **Y-axis Label**: "Render Time (seconds)"
- **Unit**: seconds
- **Legend**: `{{component_name}} ({{page}})`

### 4.5 Panel 4: React Component Average Render Time

**Query:**

```promql
rate(react_component_render_duration_seconds_sum[5m]) / rate(react_component_render_duration_seconds_count[5m])
```

**Settings:**

- **Title**: "React Component Average Render Time"
- **Visualization**: Time series
- **Y-axis Label**: "Render Time (seconds)"
- **Unit**: seconds
- **Legend**: `{{component_name}} ({{page}})`

### 4.6 Panel 5: API Request Rate

**Query:**

```promql
rate(api_requests_total{endpoint_type="api"}[5m])
```

**Settings:**

- **Title**: "API Request Rate"
- **Visualization**: Time series
- **Y-axis Label**: "Requests per Second"
- **Unit**: reqps
- **Legend**: `{{method}} {{route}}`

### 4.7 Panel 6: Component Render Count

**Query:**

```promql
rate(react_component_render_duration_seconds_count[5m])
```

**Settings:**

- **Title**: "Component Render Rate"
- **Visualization**: Time series
- **Y-axis Label**: "Renders per Second"
- **Unit**: renders/s
- **Legend**: `{{component_name}} ({{page}})`

## 📈 Step 5: Advanced Queries

### 5.1 Specific API Endpoint Monitoring

```promql
# Specific API endpoint 95th percentile
histogram_quantile(0.95, rate(api_response_duration_seconds_bucket{route="/api/users"}[5m]))

# Specific API endpoint average
rate(api_response_duration_seconds_sum{route="/api/users"}[5m]) / rate(api_response_duration_seconds_count{route="/api/users"}[5m])
```

### 5.2 Specific Component Monitoring

```promql
# Specific component 95th percentile
histogram_quantile(0.95, rate(react_component_render_duration_seconds_bucket{component_name="UserList"}[5m]))

# Specific component average
rate(react_component_render_duration_seconds_sum{component_name="UserList"}[5m]) / rate(react_component_render_duration_seconds_count{component_name="UserList"}[5m])
```

### 5.3 Error Rate Monitoring

```promql
# API error rate
rate(api_requests_total{status_code=~"5.."}[5m])

# API success rate
rate(api_requests_total{status_code=~"2.."}[5m])
```

## 🎨 Step 6: Dashboard Layout

### 6.1 Recommended Layout

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
└─────────────────┴─────────────────┘
```

### 6.2 Panel Configuration Tips

1. **Time Range**: Set to "Last 1 hour" or "Last 6 hours"
2. **Refresh**: Set to 15s for real-time updates
3. **Thresholds**: Add red/yellow/green thresholds
4. **Annotations**: Add deployment markers

## 🚨 Step 7: Alerts Setup

### 7.1 API Performance Alerts

```promql
# Alert: API response time > 5 seconds
histogram_quantile(0.95, rate(api_response_duration_seconds_bucket{endpoint_type="api"}[5m])) > 5
```

### 7.2 React Performance Alerts

```promql
# Alert: React render time > 1 second
histogram_quantile(0.95, rate(react_component_render_duration_seconds_bucket[5m])) > 1
```

## ✅ Step 8: Testing & Validation

### 8.1 Generate Test Data

```bash
# Test API performance
node scripts/test-api-performance.js

# Test React component performance
node scripts/test-react-performance.js
```

### 8.2 Validation Checklist

- [ ] Metrics endpoint returns data
- [ ] Prometheus targets are UP
- [ ] Grafana panels show data
- [ ] React components record render times
- [ ] API endpoints record response times
- [ ] Alerts trigger correctly

## 🎉 Success Indicators

Your monitoring setup is successful when:

- ✅ API response times are visible in Grafana
- ✅ React component render times are tracked
- ✅ 95th percentile and average times are displayed
- ✅ Real-time updates work
- ✅ Alerts trigger on performance issues

## 📚 Additional Resources

- [Prometheus Histogram Documentation](https://prometheus.io/docs/concepts/metric_types/#histogram)
- [Grafana Query Editor Guide](https://grafana.com/docs/grafana/latest/panels/query-editor/)
- [React Performance Monitoring](https://react.dev/learn/render-and-commit)
