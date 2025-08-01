# Environment Variables Reference

This document lists all the environment variables required for your Timesheet AI Assistant application.

## 🔑 Required Environment Variables

### **Database**
```bash
DATABASE_URL="postgresql://username:password@host:port/database"
```
- **Description**: PostgreSQL connection string
- **Required**: ✅ Yes
- **Examples**: 
  - Supabase: `postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres`
  - Neon: `postgresql://[user]:[password]@[host]/[database]`
  - Railway: `postgresql://[user]:[password]@[host]:[port]/[database]`

### **Authentication**
```bash
JWT_SECRET="your-super-secret-jwt-key-here"
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="https://your-domain.vercel.app"
```
- **Description**: Secrets for JWT and NextAuth.js
- **Required**: ✅ Yes
- **Generate**: Use `openssl rand -base64 32` to generate secure secrets

### **AI Services**
```bash
GEMINI_API_KEY="your-gemini-api-key"
```
- **Description**: Google Gemini AI API key
- **Required**: ✅ Yes
- **Get it**: [Google AI Studio](https://makersuite.google.com/app/apikey)

### **Payment Processing (Optional)**
```bash
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```
- **Description**: Stripe API keys for payment processing
- **Required**: ❌ No (only if using payments)
- **Get it**: [Stripe Dashboard](https://dashboard.stripe.com/apikeys)

## 🌍 Environment Setup

### **Local Development (.env.local)**
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/timesheet_db"

# Authentication
JWT_SECRET="dev-jwt-secret-key"
NEXTAUTH_SECRET="dev-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# AI Services
GEMINI_API_KEY="your-gemini-api-key"

# Optional: Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### **Production (Vercel)**
Set these in your Vercel project dashboard:

| Variable | Value | Environment |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://...` | Production, Preview, Development |
| `JWT_SECRET` | `your-secret-here` | Production, Preview, Development |
| `NEXTAUTH_SECRET` | `your-nextauth-secret` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` | Production |
| `GEMINI_API_KEY` | `your-gemini-key` | Production, Preview, Development |
| `STRIPE_SECRET_KEY` | `sk_live_...` | Production, Preview, Development |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Production, Preview, Development |

### **GitHub Actions (Secrets)**
Add these to your GitHub repository secrets:

| Secret Name | Description |
|-------------|-------------|
| `VERCEL_TOKEN` | Vercel API token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret |
| `NEXTAUTH_SECRET` | NextAuth.js secret |
| `NEXTAUTH_URL` | Your production URL |
| `GEMINI_API_KEY` | Google Gemini API key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret |

## 🔧 Setup Commands

### **Generate Secure Secrets**
```bash
# Generate JWT secret
openssl rand -base64 32

# Generate NextAuth secret
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### **Vercel CLI Commands**
```bash
# Add environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add GEMINI_API_KEY

# Pull environment variables locally
vercel env pull .env.local

# List environment variables
vercel env ls
```

### **Database Setup**
```bash
# Generate migrations
pnpm run db:generate

# Run migrations
pnpm run db:migrate

# Seed database (optional)
pnpm run db:seed
```

## 🚨 Security Best Practices

### **Secrets Management**
- ✅ Use strong, randomly generated secrets
- ✅ Never commit secrets to version control
- ✅ Use different secrets for development and production
- ✅ Regularly rotate your secrets
- ❌ Don't use simple strings like "secret" or "password"

### **Environment Variables**
- ✅ Use Vercel's environment variable system for production
- ✅ Use `.env.local` for local development only
- ✅ Add `.env.local` to `.gitignore`
- ❌ Don't hardcode secrets in your code

### **API Keys**
- ✅ Store API keys securely
- ✅ Use environment variables for all API keys
- ✅ Restrict API key permissions to minimum required
- ❌ Don't expose API keys in client-side code

## 🔍 Validation

### **Check Environment Variables**
```bash
# Check if all required variables are set
node -e "
const required = ['DATABASE_URL', 'JWT_SECRET', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL', 'GEMINI_API_KEY'];
const missing = required.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error('Missing environment variables:', missing);
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set');
}
"
```

### **Test Database Connection**
```bash
# Test database connection
pnpm run db:setup
```

### **Test API Keys**
```bash
# Test Gemini API key (create a simple test script)
node -e "
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log('✅ Gemini API key is valid');
"
```

## 📝 Quick Setup Checklist

- [ ] Set up PostgreSQL database (Supabase/Neon/Railway)
- [ ] Get Gemini API key from Google AI Studio
- [ ] Generate JWT and NextAuth secrets
- [ ] Set up Vercel project
- [ ] Add environment variables to Vercel
- [ ] Add GitHub secrets for CI/CD
- [ ] Test database connection
- [ ] Test API keys
- [ ] Deploy and verify

## 🆘 Troubleshooting

### **Common Issues**

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Verify database is accessible
   - Check SSL configuration

2. **Authentication Errors**
   - Verify JWT_SECRET and NEXTAUTH_SECRET are set
   - Check NEXTAUTH_URL matches your domain
   - Ensure secrets are strong enough

3. **API Key Errors**
   - Verify GEMINI_API_KEY is valid
   - Check API key permissions
   - Ensure key is not expired

4. **Environment Variables Not Loading**
   - Check variable names match exactly
   - Verify variables are set in correct environment
   - Restart development server after changes

### **Debug Commands**
```bash
# Check environment variables
echo $DATABASE_URL
echo $JWT_SECRET
echo $GEMINI_API_KEY

# Test database connection
psql $DATABASE_URL -c "SELECT 1;"

# Check Vercel environment
vercel env ls
``` 