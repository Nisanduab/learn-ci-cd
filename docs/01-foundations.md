# Module 1: CI/CD Foundations

## 🎯 What You'll Learn
- What CI/CD really means and why every company uses it
- How GitHub Actions works under the hood
- YAML syntax for pipeline configuration
- Your first working CI pipeline

---

## 📖 The Big Picture

### Before CI/CD (The "Old Way")
```
Developer writes code
    ↓
Manually runs tests on their machine (maybe)
    ↓
Pushes to shared branch
    ↓
Another developer's code breaks because of the change
    ↓
Nobody notices until Friday at 5pm
    ↓
🔥 Weekend debugging 🔥
```

### With CI/CD (The Modern Way)
```
Developer writes code
    ↓
Pushes to branch / Opens PR
    ↓
GitHub Actions AUTOMATICALLY:
  ✅ Checks code quality (lint)
  ✅ Runs all tests
  ✅ Builds the project
  ✅ Reports results on the PR
    ↓
If anything fails → PR is blocked ❌
If everything passes → Safe to merge ✅
    ↓
Merge to main → Auto-deploy to production 🚀
```

---

## 🔑 Key Concepts

### 1. Pipeline
A **pipeline** is a sequence of automated steps that run on every code change.

Think of it like a **quality checkpoint assembly line**:
```
Code Push → [Lint] → [Test] → [Build] → [Deploy]
                ↓         ↓        ↓          ↓
              Pass?     Pass?    Pass?      Pass?
              If No:    If No:   If No:     If No:
              STOP ❌   STOP ❌  STOP ❌    ROLLBACK ⏪
```

### 2. Job
A **job** is one major stage in the pipeline. Each job runs on a fresh virtual machine.

### 3. Step
A **step** is a single command or action within a job.

### 4. Runner
A **runner** is the machine that executes your pipeline. GitHub provides free runners:
- `ubuntu-latest` — Linux (most common)
- `windows-latest` — Windows
- `macos-latest` — macOS

### 5. Trigger
A **trigger** defines WHEN your pipeline runs:
- `push` — When code is pushed
- `pull_request` — When a PR is opened/updated
- `schedule` — On a cron schedule (e.g., nightly builds)
- `workflow_dispatch` — Manual trigger

---

## 📁 Understanding the YAML File

YAML is just a human-readable data format (like JSON but cleaner).

```yaml
# This is a comment

# Simple key-value
name: CI Pipeline

# Nested structure (indentation matters!)
on:
  push:
    branches:
      - main      # This is a list item
      - develop   # Another list item

# Complex nested structure
jobs:
  test:                      # Job ID (you choose this name)
    name: Run Tests          # Display name in GitHub UI
    runs-on: ubuntu-latest   # Which runner to use
    steps:                   # List of steps
      - name: Checkout       # Step 1
        uses: actions/checkout@v4
      - name: Run tests      # Step 2
        run: npm test         # Shell command to execute
```

### YAML Rules
| Rule | Example | Wrong |
|------|---------|-------|
| Indent with **2 spaces** | `  key: value` | `\tkey: value` (tabs) |
| Lists use `- ` | `- item` | `* item` |
| Strings usually don't need quotes | `name: My Pipeline` | — |
| Multi-line strings use `\|` | See below | — |

```yaml
# Multi-line command
- name: Run multiple commands
  run: |
    echo "Line 1"
    echo "Line 2"
    npm test
```

---

## 🗂️ Project Structure Explained

```
Learn CI-CD/
├── .github/
│   └── workflows/
│       └── ci.yml          ← 🌟 THE CI PIPELINE (GitHub reads this)
├── src/
│   ├── app.ts              ← Express app (routes, middleware)
│   ├── server.ts           ← Server startup (separated for testing!)
│   └── tests/
│       └── app.test.ts     ← 🧪 Tests (CI runs these automatically)
├── package.json            ← Dependencies + npm scripts
├── tsconfig.json           ← TypeScript compiler config
├── vitest.config.ts        ← Test runner config
├── eslint.config.mjs       ← Linter config
└── .gitignore              ← Files Git should ignore
```

### Why is `app.ts` separate from `server.ts`?
This is a **CI/CD best practice**! If you put `app.listen()` inside `app.ts`, the server would start every time you import the app in tests. By separating them:
- `app.ts` — exports the app (tests import this)
- `server.ts` — starts the server (production uses this)

---

## 🧪 Understanding the Tests

Tests are the **backbone** of CI/CD. Without tests, CI is just checking if your code compiles.

### What our tests verify:
| Test | What it checks | Why it matters |
|------|---------------|----------------|
| `GET /health` returns 200 | App starts correctly | Deployment health check |
| `GET /api/greet` default | Basic route works | Core functionality |
| `GET /api/greet?name=Nisan` | Query params work | Input handling |
| `POST /api/calculate` add | Business logic (happy path) | Core feature |
| Division by zero | Error handling | Edge cases don't crash |
| Invalid operation | Input validation | Security & stability |

---

## 🚀 How to Activate This Pipeline

### Step-by-step:

1. **Create a GitHub repository**
   - Go to [github.com/new](https://github.com/new)
   - Name it `learn-ci-cd`
   - Make it public (free CI minutes)
   - Do NOT initialize with README (we already have files)

2. **Initialize Git and push**
   ```bash
   cd "Learn CI-CD"
   git init
   git add .
   git commit -m "feat: initial project setup with CI pipeline"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/learn-ci-cd.git
   git push -u origin main
   ```

3. **Watch the magic happen!**
   - Go to your repo on GitHub
   - Click the **"Actions"** tab
   - You'll see your pipeline running! 🎉

### What you'll see:
```
CI Pipeline
├── 🔍 Lint Code ........... ✅ (or ❌)
├── 🧪 Run Tests ........... ✅ (or ❌)
└── 🏗️ Build ............... ✅ (or ❌)
```

---

## 📊 Understanding Pipeline Results

### ✅ All Green
```
Lint  → ✅ No code quality issues
Test  → ✅ All 8 tests passed
Build → ✅ TypeScript compiled successfully
```
**Meaning**: Your code is clean, tested, and builds correctly. Safe to merge!

### ❌ Something Failed
```
Lint  → ❌ ESLint found 2 errors
Test  → ⏭️ Skipped (lint failed, so tests didn't run)
Build → ⏭️ Skipped
```
**Meaning**: Fix the lint errors first, then push again. The pipeline will re-run automatically.

---

## 🎓 Key Takeaways

1. **CI/CD automates quality checks** — no more "it works on my machine"
2. **Pipelines run on every push** — instant feedback
3. **Jobs can depend on each other** — `lint → test → build`
4. **YAML defines the pipeline** — `.github/workflows/*.yml`
5. **Tests are essential** — without tests, CI is just a build check
6. **`npm ci` in CI, not `npm install`** — reproducibility matters
7. **Separate app from server** — testability is a design decision

---

## ✅ Module 1 Checklist

- [ ] Understand what CI/CD means
- [ ] Understand the YAML pipeline structure
- [ ] Read through `ci.yml` and understand every line
- [ ] Read through `app.test.ts` and understand why each test exists
- [ ] Create a GitHub repository
- [ ] Push the code and watch the pipeline run
- [ ] See your first green ✅ (or fix issues until you do!)

**Next Module**: [Module 2 — GitHub Actions Deep Dive](./02-github-actions.md) (advanced triggers, matrix builds, caching, secrets)
