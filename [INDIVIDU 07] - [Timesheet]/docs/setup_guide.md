# 🚀 Setup Guide - Timesheet AI Assistant

## Prerequisites

Sebelum memulai, pastikan Anda memiliki:
- Node.js 18+ 
- pnpm (recommended) atau npm
- Git
- PostgreSQL (untuk production)

## Installation Steps

### 1. Clone Repository
```bash
git clone <repository-url>
cd timesheet-ai-assistant
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Environment Setup

Buat file `.env.local` di root project dengan konfigurasi berikut:

```env
# Database Configuration
POSTGRES_URL="postgresql://username:password@localhost:5432/timesheet_ai"

# Google Gemini API (Free tier)
# Dapatkan API key dari: https://aistudio.google.com/app/apikey
GEMINI_API_KEY="your-gemini-api-key-here"

# NextAuth Configuration (untuk authentication di masa depan)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (Optional - untuk authentication di masa depan)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"


```

### 4. Database Setup (Optional)

Untuk development, aplikasi dapat berjalan tanpa database menggunakan localStorage. Namun, untuk production, setup database diperlukan:

#### Local PostgreSQL
```bash
# Install PostgreSQL
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql

# Windows
# Download dari https://www.postgresql.org/download/windows/

# Create database
createdb timesheet_ai

# Run migrations
pnpm db:migrate
```

#### Cloud Database (Recommended)
- **Supabase**: https://supabase.com/
- **Neon**: https://neon.tech/
- **Railway**: https://railway.app/

### 5. Google Gemini API Setup

1. Kunjungi https://aistudio.google.com/app/apikey
2. Login dengan Google account
3. Create API key
4. Copy API key ke `.env.local`

### 6. Start Development Server
```bash
pnpm dev
```

Buka http://localhost:3000 di browser

## Testing the Application

### 1. Add Sample Data
1. Buka halaman Timesheet
2. Klik tombol "Add Sample Data"
3. Ini akan menambahkan 12 aktivitas sample untuk testing

### 2. Test Analytics
1. Buka halaman Analytics
2. Pilih periode analisis (Mingguan/Bulanan/Tahunan)
3. Klik "Analyze with AI"
4. Review insights dan rekomendasi

### 3. Test Export
1. Di halaman Analytics, klik "Export CSV"
2. File akan di-download dengan data periode yang dipilih

## Development Commands

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build untuk production
pnpm start        # Start production server

# Database
pnpm db:generate  # Generate database migrations
pnpm db:migrate   # Run database migrations
pnpm db:studio    # Open Drizzle Studio

# Linting & Formatting
pnpm lint         # Run ESLint
pnpm format       # Run Prettier
```

## Project Structure

```
timesheet-ai-assistant/
├── app/                          # Next.js app directory
│   ├── (dashboard)/             # Dashboard routes
│   │   ├── timesheet/           # Timesheet pages
│   │   └── layout.tsx           # Dashboard layout
│   ├── api/                     # API routes
│   │   └── ai/                  # AI analysis endpoints
│   └── page.tsx                 # Landing page
├── components/                  # React components
│   └── ui/                     # shadcn/ui components
├── lib/                        # Utility libraries
│   └── db/                     # Database configuration
├── docs/                       # Documentation
└── public/                     # Static assets
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
# atau
lsof -ti:3000 | xargs kill -9
```

#### 2. Database Connection Error
- Pastikan PostgreSQL berjalan
- Check connection string di `.env.local`
- Pastikan database `timesheet_ai` sudah dibuat

#### 3. API Key Issues
- Pastikan Gemini API key valid
- Check quota usage di Google AI Studio
- Pastikan API key sudah diset di `.env.local`

#### 4. Build Errors
```bash
# Clear cache
rm -rf .next
pnpm install
pnpm build
```

### Performance Optimization

#### 1. Development
- Gunakan `pnpm dev` dengan Turbopack
- Monitor memory usage
- Restart server jika diperlukan

#### 2. Production
- Enable compression
- Use CDN for static assets
- Monitor database performance

## Deployment

### Vercel (Recommended)

1. **Push ke GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect ke Vercel**
   - Buka https://vercel.com
   - Import repository
   - Set environment variables

3. **Environment Variables di Vercel**
   - `POSTGRES_URL`: Production database URL
   - `GEMINI_API_KEY`: Your Gemini API key
   - `NEXTAUTH_SECRET`: Random secret string
   - `NEXTAUTH_URL`: Your production URL

### Other Platforms

#### Netlify
- Similar to Vercel
- Set build command: `pnpm build`
- Set publish directory: `.next`

#### Railway
- Auto-deploy from GitHub
- Built-in PostgreSQL support
- Easy environment variable management

## Security Considerations

### Environment Variables
- Never commit `.env.local` to version control
- Use different API keys for development and production
- Rotate API keys regularly

### Database Security
- Use strong passwords
- Enable SSL connections
- Regular backups
- Monitor access logs

### API Security
- Rate limiting
- Input validation
- Error handling
- CORS configuration

## Monitoring & Analytics

### Application Monitoring
- Vercel Analytics
- Error tracking (Sentry)
- Performance monitoring

### Database Monitoring
- Query performance
- Connection pooling
- Backup status

### API Monitoring
- Response times
- Error rates
- Usage patterns

## Support

Jika mengalami masalah:

1. Check documentation di `/docs`
2. Search existing issues di GitHub
3. Create new issue dengan detail lengkap
4. Contact development team

## Contributing

1. Fork repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

---

**Happy coding! 🚀** 