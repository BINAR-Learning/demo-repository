# Refactoring Documentation

## Overview
This document describes the refactoring applied to the backend server code in the `[INDIVIDU 03] - [FCM Push Notification]/server/` directory to improve clarity, readability, and performance.

---

## 1. `server.js` Improvements

### Changes Made
- **Graceful Shutdown:**
  - Added a `gracefulShutdown` function to handle `SIGTERM` and `SIGINT` signals.
  - The server now closes active connections before exiting, ensuring no requests are dropped abruptly.
- **Code Clarity:**
  - Grouped related logic and added clear function separation for maintainability.
  - Improved logging for shutdown events.

### Benefits
- Prevents abrupt termination of the server, allowing ongoing requests to complete.
- Easier to maintain and extend with additional shutdown logic if needed.
- More readable and modular code structure.

---

## 2. Recommendations for Further Improvements
- **Linting:** Add ESLint for code quality and consistency.
- **Testing:** Continue using Jest and Supertest for high coverage.
- **Separation of Concerns:** Keep Express app logic in `app.js` and server startup in `server.js` for testability.

---

## Example: Graceful Shutdown
```js
function gracefulShutdown(signal) {
  console.log(`👋 ${signal} received, shutting down gracefully`);
  server.close(() => {
    console.log('🛑 Server closed');
    process.exit(0);
  });
}
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```

---

## Summary
These changes make the backend server more robust, maintainable, and production-ready. For further improvements, consider adding linting, more tests, and documentation for API endpoints.
