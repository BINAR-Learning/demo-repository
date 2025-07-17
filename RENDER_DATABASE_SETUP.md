# Render Database Setup Guide

## Masalah SSL/TLS

Database server Render memerlukan koneksi SSL/TLS. Script sudah diupdate untuk handle ini.

## Environment Variables untuk Render

Buat file `.env.local` dengan konfigurasi Render:

```bash
# Render Database Configuration
DB_HOST=your-render-db-host.render.com
DB_PORT=5432
DB_USER=your-render-db-user
DB_PASSWORD=your-render-db-password
DB_NAME=your-render-db-name

# JWT Configuration
JWT_SECRET=super-secret-key-for-workshop-demo-only
```

## Commands untuk Render

### 1. Create Database di Render

```bash
npm run db-create-render
```

### 2. Test Connection

```bash
npm run db-test
```

## Cara Dapatkan Render Database Credentials

### 1. Buka Render Dashboard

- Login ke https://dashboard.render.com
- Pilih project database Anda

### 2. Copy Connection String

- Klik database service
- Copy "External Database URL"
- Format: `postgres://user:password@host:port/database`

### 3. Parse ke Environment Variables

```bash
# Dari: postgres://user:password@host:port/database
# Ke .env.local:
DB_HOST=host
DB_PORT=port
DB_USER=user
DB_PASSWORD=password
DB_NAME=database
```

## Troubleshooting Render

### 1. SSL Error

```bash
# Error: SSL/TLS required
# Solution: Script sudah diupdate dengan SSL config
npm run db-create-render
```

### 2. Connection Refused

- Check database status di Render dashboard
- Verify host dan port
- Check firewall settings

### 3. Authentication Failed

- Verify username dan password
- Check database permissions
- Ensure database exists

### 4. Database Doesn't Exist

- Render database harus sudah dibuat manual
- Script tidak bisa create database baru di Render
- Hanya bisa create tables

## Render Database Limitations

### 1. Tidak Bisa Create Database

- Render database sudah pre-created
- Script hanya create tables
- Database name sudah fixed

### 2. Connection Limits

- Render free tier: 1 connection
- Paid tier: multiple connections
- Script dioptimasi untuk single connection

### 3. Data Size

- Free tier: 1GB
- Paid tier: lebih besar
- Script create 100 users (reduced dari 1000)

## Script Differences

### Local Database (`db-create`)

- Create database baru
- 1000 users
- Full features

### Render Database (`db-create-render`)

- Use existing database
- 100 users (reduced)
- SSL enabled
- Optimized for Render

## Verification

Setelah setup, verify dengan:

1. **Check Tables**

   ```sql
   \dt
   ```

2. **Check Users**

   ```sql
   SELECT COUNT(*) FROM auth;
   ```

3. **Test Login**
   - Username: any user from list
   - Password: User123@

## Common Render Database URLs

### Free Tier

```
Host: your-db-name.render.com
Port: 5432
Database: your-db-name
```

### Paid Tier

```
Host: your-db-name.render.com
Port: 5432
Database: your-db-name
```

## Environment Variables Example

```bash
# .env.local untuk Render
DB_HOST=your-db-name.render.com
DB_PORT=5432
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
JWT_SECRET=your-jwt-secret
```

## Testing Connection

```bash
# Test koneksi ke Render
npm run db-test

# Create tables di Render
npm run db-create-render
```

## Tips untuk Render

1. **Free Tier Limits**

   - 1 connection
   - 1GB storage
   - 90 days trial

2. **Performance**

   - Use connection pooling
   - Optimize queries
   - Monitor usage

3. **Security**

   - SSL required
   - Strong passwords
   - Environment variables

4. **Backup**
   - Render auto backup
   - Manual export available
   - Point-in-time recovery
