# 🚀 Learn CI/CD — From Zero to Industrial Grade

A hands-on project to learn CI/CD pipelines, built with **Node.js**, **TypeScript**, and **GitHub Actions**.

## Quick Start

```bash
# Install dependencies
npm install

# Run the app locally
npm run dev

# Run tests
npm test

# Run linter
npm run lint

# Build for production
npm run build
```

## Project Structure

```
├── .github/workflows/   ← CI/CD pipeline configs (GitHub reads these)
│   └── ci.yml           ← Main CI pipeline
├── src/
│   ├── app.ts           ← Express app
│   ├── server.ts        ← Server entry point
│   └── tests/           ← Automated tests
├── docs/                ← Learning modules
│   └── 01-foundations.md
└── package.json
```

## CI/CD Pipeline

Every push triggers this pipeline:

```
Push → [🔍 Lint] → [🧪 Test] → [🏗️ Build] → ✅
```

## Learning Modules

| Module | Topic | Status |
|--------|-------|--------|
| 1 | [Foundations](docs/01-foundations.md) | ✅ Current |
| 2 | GitHub Actions Deep Dive | ⏳ Next |
| 3 | Docker & Containers | 📋 Planned |
| 4 | Environments & Secrets | 📋 Planned |
| 5 | Advanced Patterns | 📋 Planned |
| 6 | Monitoring & Rollbacks | 📋 Planned |
