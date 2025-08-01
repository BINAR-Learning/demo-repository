# Decision Tool

[![codecov](https://codecov.io/gh/chris-tinaa/decision-tool/dev/main/graph/badge.svg)](https://codecov.io/gh/chris-tinaa/decision-tool)
[![SonarQube Cloud](https://sonarcloud.io/images/project_badges/sonarcloud-light.svg)](https://sonarcloud.io/summary/new_code?id=chris-tinaa_decision-tool)
[![CI](https://github.com/chris-tinaa/decision-tool/workflows/CI/badge.svg)](https://github.com/chris-tinaa/decision-tool/actions)

## Overview

Decision Tool adalah aplikasi web modern yang membantu individu dan tim dalam mengambil keputusan yang lebih baik dan terstruktur. Aplikasi ini menyediakan 9 framework pengambilan keputusan populer dengan dukungan AI untuk memberikan rekomendasi metode yang paling sesuai dengan konteks masalah Anda.

**🔗 Repository**: [https://github.com/chris-tinaa/decision-tool](https://github.com/chris-tinaa/decision-tool)

## Tech Stack & Arsitektur

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: React Hooks
- **Internationalization**: next-intl

### Backend & API
- **API Routes**: Next.js API Routes
- **AI Integration**: OpenAI GPT-4
- **Data Storage**: Browser localStorage

### Development & Testing
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript
- **Package Manager**: npm

### CI/CD & Quality
- **CI/CD**: GitHub Actions
- **Code Coverage**: Codecov
- **Code Quality**: SonarCloud
- **Deployment**: Vercel (recommended)

## Project Structure

```
decision-tool/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # Internationalization routes
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page
│   │   ├── cost-benefit/        # Cost-Benefit Analysis tool
│   │   ├── decision-matrix/     # Decision Matrix tool
│   │   ├── decision-tree/       # Decision Tree tool
│   │   ├── eisenhower-matrix/   # Eisenhower Matrix tool
│   │   ├── pros-cons/           # Pros & Cons tool
│   │   ├── random-decision/     # Random Decision tool
│   │   ├── scenario-planning/   # Scenario Planning tool
│   │   ├── swot-analysis/       # SWOT Analysis tool
│   │   └── weighted-random/     # Weighted Random tool
│   ├── api/                     # API Routes
│   │   └── ai/                  # AI integration endpoints
│   └── globals.css              # Global styles
├── components/                   # Reusable React components
│   ├── ui/                      # Base UI components (shadcn/ui)
│   ├── confirmation-dialog.tsx  # Confirmation modal
│   ├── language-switcher.tsx    # Language selector
│   ├── loading-overlay.tsx      # Loading state
│   ├── page-header.tsx          # Page header component
│   ├── see-result-button.tsx    # Action button
│   ├── share-url-button.tsx     # Share functionality
│   ├── textarea-with-button.tsx # Input component
│   └── tool-card.tsx            # Decision tool card
├── hooks/                       # Custom React hooks
│   ├── useAiGeneration.ts       # AI API integration
│   ├── useBreakpoint.ts         # Responsive breakpoints
│   ├── useDecisionTool.ts       # Decision tool logic
│   ├── useLocalStorage.ts       # LocalStorage management
│   └── use-toast.ts             # Toast notifications
├── i18n/                        # Internationalization config
├── lib/                         # Utility functions
│   ├── consts.ts                # Constants
│   ├── cookies.ts               # Cookie utilities
│   ├── export-utils.ts          # Export functionality
│   ├── prompts.ts               # AI prompts
│   ├── sampleData.ts            # Sample data
│   ├── toolsConfig.ts           # Tools configuration
│   └── utils.ts                 # General utilities
├── messages/                    # Translation files
│   ├── en.json                  # English translations
│   └── id.json                  # Indonesian translations
├── public/                      # Static assets
├── test/                        # Test setup
├── docs/                        # Documentation
├── __tests__/                   # Test files (co-located)
├── .github/workflows/           # CI/CD workflows
└── package.json                 # Dependencies & scripts
```

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, atau pnpm

### Installation

1. **Clone repository**:
   ```bash
   git clone https://github.com/chris-tinaa/decision-tool.git
   cd decision-tool
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # atau
   yarn install
   # atau
   pnpm install
   ```

3. **Setup environment variables** (opsional, untuk fitur AI):
   ```bash
   cp .env.example .env.local
   # Edit .env.local dan tambahkan OPENAI_API_KEY
   ```

4. **Jalankan development server**:
   ```bash
   npm run dev
   # atau
   yarn dev
   # atau
   pnpm dev
   ```

5. **Buka aplikasi**: [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

## Fitur-Fitur

### 🎯 Decision Making Tools
- **Decision Matrix**: Evaluasi opsi berdasarkan kriteria berbobot
- **Pros & Cons**: Analisis keuntungan dan kerugian
- **Cost-Benefit Analysis**: Analisis biaya dan manfaat
- **Decision Tree**: Visualisasi keputusan bertingkat
- **Eisenhower Matrix**: Prioritas berdasarkan urgensi dan kepentingan
- **SWOT Analysis**: Analisis Strengths, Weaknesses, Opportunities, Threats
- **Scenario Planning**: Perencanaan berdasarkan skenario
- **Random Decision**: Keputusan acak dengan probabilitas
- **Weighted Random**: Keputusan acak berbobot

### 🤖 AI Integration
- **Smart Recommendations**: AI memberikan saran metode terbaik
- **Context Analysis**: Analisis konteks masalah untuk rekomendasi
- **OpenAI GPT-4**: Integrasi dengan model AI terdepan

### 🌐 User Experience
- **Multilingual**: Bahasa Indonesia dan Inggris
- **Responsive Design**: Optimal di desktop dan mobile
- **Dark/Light Mode**: Tema yang dapat disesuaikan
- **Accessibility**: Mengikuti standar WCAG

### 💾 Data Management
- **Local Storage**: Data tersimpan di browser
- **Export/Import**: Export hasil ke JSON/CSV
- **Share URLs**: Bagikan keputusan via URL
- **Sample Data**: Data contoh untuk eksplorasi

### 🔧 Developer Features
- **TypeScript**: Type safety dan better DX
- **Testing**: Comprehensive test suite
- **CI/CD**: Automated testing dan deployment
- **Code Quality**: ESLint, Prettier, SonarCloud

## Deployment

1. **Fork repository** ke akun GitHub Anda

2. **Connect ke Vercel**:
   - Kunjungi [vercel.com](https://vercel.com)
   - Import project dari GitHub
   - Vercel akan otomatis detect Next.js

3. **Set environment variables** (jika menggunakan AI):
   ```
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Deploy**: Vercel akan otomatis deploy setiap push ke main branch


# Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

Jika Anda mengalami masalah atau memiliki saran:
- 🐛 [Report Bug](https://github.com/chris-tinaa/decision-tool/issues)
- 💡 [Request Feature](https://github.com/chris-tinaa/decision-tool/issues)
- 📧 Contact: [christina@example.com](mailto:christina@example.com)

---

**Made with ❤️ by [Christina](https://github.com/chris-tinaa)**
