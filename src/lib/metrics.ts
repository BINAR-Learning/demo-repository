import {
  register,
  collectDefaultMetrics,
  Counter,
  Histogram,
  Gauge,
} from "prom-client";

// Enable default metrics collection
collectDefaultMetrics();

// Custom metrics
export const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
});

export const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route"],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60, 120, 300],
});

export const activeUsers = new Gauge({
  name: "active_users_total",
  help: "Total number of active users",
});

export const databaseQueryDuration = new Histogram({
  name: "database_query_duration_seconds",
  help: "Database query duration in seconds",
  labelNames: ["query_type"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10, 30, 60, 120, 300],
});

export const jwtTokenGenerationDuration = new Histogram({
  name: "jwt_token_generation_duration_seconds",
  help: "JWT token generation duration in seconds",
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1],
});

// Function to get metrics
export async function getMetrics() {
  return await register.metrics();
}

// Function to reset metrics (useful for testing)
export function resetMetrics() {
  register.clear();
}
