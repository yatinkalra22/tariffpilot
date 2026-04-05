# TariffPilot — Testing Guide

Step-by-step instructions to test the entire application locally.

---

## Prerequisites

Before testing, make sure you have:

- [x] Completed the [Setup Guide](SETUP_GUIDE.md) (keys, database, env files)
- [x] Run `pnpm install` at the project root
- [x] Run database migrations: `cd apps/api && npx prisma migrate deploy`

---

## 1. Start the Application

Open a terminal at the project root and run:

```bash
pnpm dev
```

This starts both services:
- **Frontend** → http://localhost:3000
- **Backend** → http://localhost:3001

Wait until you see both services are ready in the terminal output.

---

## 2. Verify Backend Health

Open a new terminal and run:

```bash
curl http://localhost:3001/health
```

**Expected response:**

```json
{"status":"ok","timestamp":"2026-04-05T..."}
```

If this fails, check:
- Is the backend running? Look for errors in the `pnpm dev` terminal
- Is port 3001 in use? Try `lsof -i :3001`
- Is `DATABASE_URL` correct in `apps/api/.env`?

---

## 3. Test the Full Analysis Flow (UI)

### Step 3.1 — Open the Landing Page

1. Go to http://localhost:3000
2. You should see the TariffPilot landing page with a hero section and "Analyze Now" button
3. Click **"Analyze Now"** — it should navigate to `/analyze`

### Step 3.2 — Run an Analysis

1. On the Analyze page, enter a product description. Try one of these:

   | Test Product | What to Expect |
   |-------------|----------------|
   | `Wireless Bluetooth earbuds with active noise cancellation and a charging case` | Electronics classification (Chapter 85), Section 301 tariff from China |
   | `Stainless steel kitchen knife set with wooden handles` | Steel products (Chapter 82), possible Section 232 tariff |
   | `Children's electric ride-on toy car with remote control` | Toys classification (Chapter 95), lower duty rates |
   | `Solar panels for residential installation, 400W monocrystalline` | Electrical equipment (Chapter 85), Section 301 impact |

2. Select **Country of Origin** (default: China)
3. Enter a **CIF Value** (default: $10,000)
4. Click **"Analyze Import Duties"**

### Step 3.3 — Watch the Agent Progress

You should see 5 steps executing in real-time:

```
Step 1: HTS Classification        → Classifying product...
Step 2: Duty Calculation           → Calculating duty layers...
Step 3: FTA Screening              → Checking free trade agreements...
Step 4: Country Comparison         → Comparing sourcing countries...
Step 5: Report Generation          → Generating report...
```

Each step shows a spinner while running and a checkmark when complete. The full analysis typically takes 30-60 seconds.

**If a step fails:** Check the terminal running `pnpm dev` for error logs. Common issues:
- Invalid or expired `ZAI_API_KEY`
- Database connection lost
- Rate limiting from Z.AI API

### Step 3.4 — Review the Results Page

After all 5 steps complete, you'll be automatically redirected to `/results/<id>`. Verify:

- [ ] **HTS Classification** — Shows a 10-digit code, description, and confidence score
- [ ] **Duty Breakdown** — Table with up to 5 duty layers (MFN, Section 301, Section 232, MPF, HMF)
- [ ] **Country Comparison** — Table comparing 8 countries with total rates and savings vs China
- [ ] **Recommendations** — Actionable suggestions for duty savings
- [ ] **Executive Summary** — AI-generated overview of the analysis

### Step 3.5 — Test PDF & Excel Export

On the results page:

1. Click **"Download PDF"**
   - A PDF file should download
   - Open it — verify it contains the classification, duty breakdown, country comparison, and recommendations

2. Click **"Download Excel"**
   - An `.xlsx` file should download
   - Open it — verify it has 3 sheets: Summary, Duty Breakdown, Country Comparison

---

## 4. Test Session History

1. Go to http://localhost:3000/history
2. You should see the analysis you just ran listed with:
   - Product description
   - HTS code
   - Total duty rate
   - Timestamp
3. Click on it — it should navigate back to the results page

---

## 5. Test the API Directly

You can test the backend API without the frontend using `curl`.

### Health Check

```bash
curl http://localhost:3001/health
```

### Start an Analysis (SSE Stream)

```bash
curl -N -X POST http://localhost:3001/analysis/stream \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Wireless Bluetooth earbuds with noise cancellation",
    "originCountry": "CN",
    "cifValue": 10000,
    "sessionId": "test-session-123"
  }'
```

You should see SSE events streaming in:

```
data: {"type":"step_start","step":1,"stepName":"HTS Classification",...}
data: {"type":"step_complete","step":1,"stepName":"HTS Classification",...}
data: {"type":"step_start","step":2,"stepName":"Duty Calculation",...}
...
data: {"type":"analysis_complete","analysisId":"clxyz...",...}
```

### Retrieve an Analysis

```bash
# Replace <id> with the analysisId from the stream output
curl http://localhost:3001/analysis/<id>
```

### Get Session History

```bash
curl http://localhost:3001/analysis/history/test-session-123
```

### Download PDF Report

```bash
curl -o report.pdf http://localhost:3001/report/<id>/pdf
```

### Download Excel Report

```bash
curl -o report.xlsx http://localhost:3001/report/<id>/excel
```

---

## 6. Run Automated Tests

### Backend Unit Tests

```bash
cd apps/api
pnpm test
```

### Backend Test Coverage

```bash
cd apps/api
pnpm test:cov
```

### Lint All Packages

```bash
# From project root
pnpm lint
```

### Type Check

```bash
# From project root
pnpm typecheck
```

---

## 7. Testing Checklist

Use this checklist to verify everything works before submission:

### Backend
- [ ] `curl /health` returns `{"status":"ok"}`
- [ ] SSE stream starts and delivers all 5 steps
- [ ] Analysis is saved to the database
- [ ] PDF downloads correctly
- [ ] Excel downloads correctly with 3 sheets
- [ ] History endpoint returns past analyses

### Frontend
- [ ] Landing page loads at `/`
- [ ] "Analyze Now" navigates to `/analyze`
- [ ] Example product buttons populate the textarea
- [ ] Analysis form submits and shows progress steps
- [ ] All 5 agent steps complete with checkmarks
- [ ] Auto-redirect to results page after completion
- [ ] Results page shows classification, duties, comparison, recommendations
- [ ] PDF download button works
- [ ] Excel download button works
- [ ] History page at `/history` lists past analyses
- [ ] Clicking a history item navigates to its results

### Edge Cases
- [ ] Empty product description — submit button should be disabled
- [ ] Different countries (try Vietnam, Mexico) — duty rates should change
- [ ] Different CIF values ($1,000 vs $100,000) — amounts should scale correctly
- [ ] Refresh the results page — data should persist (loaded from DB)

---

## Common Issues

| Problem | Solution |
|---------|----------|
| `ECONNREFUSED` on port 3001 | Backend isn't running — check `pnpm dev` output |
| `CORS error` in browser console | Set `CORS_ORIGIN=http://localhost:3000` in `apps/api/.env` |
| SSE stream hangs with no events | Check `ZAI_API_KEY` is valid, check API terminal for errors |
| PDF/Excel download returns 404 | Analysis ID may be wrong — run a new analysis first |
| History page is empty | Ensure `sessionId` is consistent (stored in localStorage) |
| `PrismaClientInitializationError` | Database isn't running or `DATABASE_URL` is wrong |
| Steps complete but no redirect | Check browser console for JS errors |
