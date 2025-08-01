# CI/CD Pipeline Setup

This document describes the comprehensive CI/CD pipeline setup for the Timesheet AI Assistant project.

## 🚀 Overview

The CI/CD pipeline consists of multiple GitHub Actions workflows that ensure code quality, security, and reliable deployments.

## 📋 Workflows

### 1. Main CI/CD Pipeline (`ci.yml`)

**Triggers:** Push to `main`/`develop` branches, Pull Requests

**Jobs:**
- **Lint and Test**: Runs on Node.js 18.x and 20.x
  - ESLint code linting
  - TypeScript type checking
  - Unit tests with coverage
  - Coverage threshold validation (80%)
  - Codecov integration

- **Build**: Creates production build artifacts
  - Builds the Next.js application
  - Uploads build artifacts

- **Security Scan**: Security vulnerability checks
  - npm audit
  - Snyk security scanning

- **Notify**: Success/failure notifications

### 2. Pull Request Checks (`pr-checks.yml`)

**Triggers:** Pull Requests to `main`/`develop` branches

**Jobs:**
- **Code Quality**: ESLint, TypeScript, formatting
- **Test Coverage**: Tests with coverage reporting and PR comments
- **Build Check**: Ensures the application builds successfully
- **Security Check**: Vulnerability scanning

### 3. Production Deployment (`deploy.yml`)

**Triggers:** Git tags starting with `v*` (e.g., `v1.0.0`)

**Jobs:**
- **Deploy**: Full deployment pipeline
  - Runs all checks
  - Creates GitHub release
  - Deploys to production
  - Sends notifications

## 🛠️ Setup Instructions

### 1. Required Secrets

Add these secrets to your GitHub repository:

```bash
# Codecov integration
CODECOV_TOKEN=your_codecov_token

# Snyk security scanning
SNYK_TOKEN=your_snyk_token

# Vercel deployment (optional)
VERCEL_TOKEN=your_vercel_token
```

### 2. Package.json Scripts

The following scripts are required:

```json
{
  "scripts": {
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "ci": "npm run lint && npm run type-check && npm run test:coverage"
  }
}
```

### 3. Configuration Files

#### ESLint Configuration (`.eslintrc.json`)
```json
{
  "extends": [
    "next/core-web-vitals",
    "next/typescript"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "no-var": "error",
    "no-console": "warn",
    "eqeqeq": "error",
    "curly": "error"
  }
}
```

#### Jest Configuration (`jest.config.js`)
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/api/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/__tests__/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
}

module.exports = createJestConfig(customJestConfig)
```

## 📊 Coverage Requirements

- **Minimum Coverage**: 70% for branches, functions, lines, and statements
- **CI Threshold**: 80% overall coverage
- **Coverage Reports**: Generated in multiple formats (text, lcov, html, json)

## 🔒 Security Checks

- **npm audit**: Checks for known vulnerabilities in dependencies
- **Snyk**: Advanced security scanning for vulnerabilities
- **Threshold**: Moderate level vulnerabilities trigger warnings

## 🚀 Deployment Process

### Manual Deployment
1. Create a git tag: `git tag v1.0.0`
2. Push the tag: `git push origin v1.0.0`
3. The deployment workflow will automatically trigger

### Automated Deployment
- Merges to `main` branch trigger build and artifact creation
- Tagged releases trigger full production deployment

## 📈 Monitoring and Reporting

### Codecov Integration
- Automatic coverage reporting
- Coverage trends and history
- PR coverage comments

### GitHub Actions Insights
- Workflow run history
- Performance metrics
- Failure analysis

## 🛠️ Local Development

### Running Checks Locally
```bash
# Run all CI checks
npm run ci

# Run individual checks
npm run lint
npm run type-check
npm run test:coverage
```

### Pre-commit Hooks (Recommended)
Install husky for pre-commit hooks:

```bash
npm install --save-dev husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npm run ci"
```

## 🔧 Troubleshooting

### Common Issues

1. **Coverage Threshold Failures**
   - Add more tests to increase coverage
   - Exclude files that don't need testing
   - Adjust threshold in jest.config.js

2. **ESLint Errors**
   - Run `npm run lint:fix` to auto-fix issues
   - Review and fix remaining issues manually

3. **TypeScript Errors**
   - Fix type annotations
   - Add proper interfaces and types
   - Use `any` sparingly

4. **Build Failures**
   - Check for missing dependencies
   - Verify environment variables
   - Review build logs for specific errors

### Getting Help

- Check GitHub Actions logs for detailed error messages
- Review the workflow files in `.github/workflows/`
- Consult the Jest and ESLint documentation

## 📝 Best Practices

1. **Always run `npm run ci` before pushing**
2. **Keep test coverage above 70%**
3. **Fix linting issues immediately**
4. **Use meaningful commit messages**
5. **Create feature branches for new development**
6. **Test thoroughly before creating releases**

## 🔄 Workflow Customization

The workflows can be customized by modifying the YAML files in `.github/workflows/`:

- Add new jobs or steps
- Modify triggers
- Change Node.js versions
- Add new deployment targets
- Customize notifications

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Jest Testing Framework](https://jestjs.io/)
- [ESLint Configuration](https://eslint.org/docs/user-guide/configuring)
- [Codecov Documentation](https://docs.codecov.io/)
- [Snyk Security](https://snyk.io/docs/) 