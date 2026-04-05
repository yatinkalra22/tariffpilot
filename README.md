# TariffPilot AI

**AI-powered US tariff classification and duty calculation platform.** Instantly analyze products against the Harmonized Tariff Schedule, calculate multi-layer duty stacks, and compare sourcing costs across 8 countries.

Built with GLM 5.1 (via Z.AI), NestJS, Next.js 16, and PostgreSQL.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js Frontend                        │
│              Landing → Analyze → Results → History              │
│                    (SSE progress streaming)                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │ POST /analysis/stream (SSE)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NestJS Backend API                         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Agent Orchestrator (5-Step Chain)            │   │
│  │                                                          │   │
│  │  Step 1: HTS Classification ──► hts_lookup tool ──► DB   │   │
│  │      │                                                    │   │
│  │  Step 2: Duty Calculation ────► section301_check tool     │   │
│  │      │                                                    │   │
│  │  Step 3: FTA Screening ───────► fta_database tool   ─┐   │   │
│  │  Step 4: Country Comparison ──► country_compare tool ─┤   │   │
│  │      │                              (parallel)        │   │   │
│  │  Step 5: Report Generation ◄──────────────────────────┘   │   │
│  └──────────────┬───────────────────────────────────────────┘   │
│                 │                                                │
│    ┌────────────▼────────────┐    ┌──────────────────────┐      │
│    │   GLM 5.1 via Z.AI     │    │    PostgreSQL DB      │      │
│    │   (OpenAI-compatible)   │    │  HTS codes, analyses │      │
│    │   - Tool calling        │    │  AD/CVD orders       │      │
│    │   - Multi-step reasoning│    └──────────────────────┘      │
│    └─────────────────────────┘                                   │
│                                                                  │
│    ┌─────────────────────────────────────────────┐               │
│    │          Report Export Service               │               │
│    │    PDF (pdfmake)  ·  Excel (exceljs)        │               │
│    └─────────────────────────────────────────────┘               │
└──────────────────────────────────────────────────────────────────┘
```

## Why GLM 5.1

TariffPilot is built entirely around GLM 5.1's strengths in **long-horizon reasoning**, **tool use**, and **multi-step agent workflows** — the exact capabilities this model was optimized for.

**Multi-step agentic chain.** Each analysis runs a 5-step agent pipeline where GLM 5.1 acts as the reasoning engine at every stage. This isn't a single API call — it's a full agentic loop where the model decides which tools to call, interprets their results, and iterates up to 10 times per step before producing a final answer. Steps 3 and 4 run in parallel, demonstrating concurrent agent execution.

**Tool use with real data.** GLM 5.1 drives 4 custom function-calling tools that query a PostgreSQL database of US HTS codes, Section 301 tariff lists, FTA partner rates, and country-specific duty calculations. The model autonomously decides when and how to use each tool based on the product being analyzed — for example, only calling `section301_check` for China-origin goods, or searching multiple HTS chapters when the first lookup returns no matches.

**Long-horizon reasoning for trade compliance.** Tariff classification requires applying GRI (General Rules of Interpretation) — a hierarchical legal framework where each rule depends on the previous one. GLM 5.1's long-context reasoning handles this naturally, maintaining coherence across the full classification → duty calculation → FTA screening → country comparison → report generation chain. The model carries forward context from earlier steps (like the HTS code and MFN rate) to inform later calculations without losing accuracy.

**Structured output generation.** Every step requires the model to produce precise JSON with specific fields (rates as decimals, amounts in dollars, legal citations). GLM 5.1 reliably generates valid structured output even for complex nested objects like the 5-layer duty stack.

## Features

- **HTS Classification** — Natural language product descriptions classified to 10-digit HTS codes using GRI rules
- **5-Layer Duty Stacking** — MFN rates, Section 301, Section 232, MPF, and HMF calculated automatically
- **FTA Screening** — Checks 20 US free trade agreement partner countries for preferential rates
- **Country Comparison** — Side-by-side landed cost analysis across 8 major sourcing countries
- **Real-time Streaming** — Server-Sent Events deliver live step-by-step progress to the browser
- **PDF & Excel Export** — Download branded compliance reports or detailed workbooks
- **Session History** — Anonymous session tracking with analysis history retrieval

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, Tailwind v4, Shadcn UI, Motion |
| **Backend** | NestJS 11, Node.js 22, Prisma 7, TypeScript 5 |
| **AI Model** | GLM 5.1 via Z.AI (OpenAI-compatible SDK) |
| **Database** | PostgreSQL |
| **Monorepo** | pnpm workspaces, Turborepo |
| **Deployment** | Vercel (frontend), Railway (backend + DB) |

## Project Structure

```
tariffpilot/
├── apps/
│   ├── api/                  # NestJS backend
│   │   ├── src/
│   │   │   ├── analysis/     # 5-step agent chain orchestration
│   │   │   ├── llm/          # GLM 5.1 integration
│   │   │   ├── tools/        # LLM agent tools (HTS, 301, FTA, comparison)
│   │   │   ├── report/       # PDF & Excel generation
│   │   │   └── database/     # Prisma service
│   │   └── prisma/
│   │       └── schema.prisma
│   └── web/                  # Next.js frontend
│       └── src/
│           ├── app/          # Pages: landing, analyze, results, history
│           ├── components/   # Agent progress, duty breakdown, comparison
│           └── lib/          # API helpers, session, types
├── packages/
│   └── shared/               # @tariffpilot/shared TypeScript types
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Getting Started

> **Need help getting API keys?** See the full [Setup Guide](docs/SETUP_GUIDE.md) for step-by-step instructions on obtaining every key and credential.

### Prerequisites

- **Node.js** >= 22
- **pnpm** >= 10.30.1
- **PostgreSQL** >= 15
- **Z.AI API key** ([z.ai](https://z.ai))

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/tariffpilot.git
cd tariffpilot

# Install dependencies
pnpm install
```

### Environment Setup

**Backend** — copy and configure the API environment file:

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env`:

```env
ZAI_API_KEY=your_zai_api_key
GLM_MODEL=glm-5-1
DATABASE_URL=postgresql://user:pass@localhost:5432/tariffpilot
CORS_ORIGIN=http://localhost:3000
PORT=3001
```

**Frontend** — create the web environment file:

```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > apps/web/.env.local
```

### Database Setup

```bash
# Run Prisma migrations
cd apps/api
npx prisma migrate deploy

# (Optional) Seed HTS codes
npx prisma db seed
```

### Development

```bash
# Start both frontend and backend in watch mode
pnpm dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| Health Check | http://localhost:3001/health |

### Build

```bash
pnpm build
```

## API Reference

### Analysis

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/analysis/stream` | Start tariff analysis (SSE stream) |
| `GET` | `/analysis/:id` | Retrieve analysis by ID |
| `GET` | `/analysis/history/:sessionId` | Get session analysis history |

#### POST /analysis/stream

```json
{
  "description": "Stainless steel water bottle, vacuum insulated, 500ml",
  "originCountry": "CN",
  "cifValue": 10000,
  "sessionId": "optional-session-id"
}
```

Returns a Server-Sent Events stream with events: `step_start`, `step_complete`, `analysis_complete`, `error`.

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/report/:id/pdf` | Download PDF compliance report |
| `GET` | `/report/:id/excel` | Download Excel workbook |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |

## How It Works

TariffPilot runs a **5-step AI agent chain** for each analysis:

```
Step 1: HTS Classification
    └─ AI classifies product → 10-digit HTS code with confidence score

Step 2: Duty Calculation
    └─ Stacks 5 duty layers: MFN + Section 301 + Section 232 + MPF + HMF

Step 3: FTA Screening
    └─ Checks 20 FTA partner countries for preferential rates

Step 4: Country Comparison
    └─ Compares total landed cost across 8 sourcing countries

Step 5: Report Generation
    └─ Executive summary, recommendations, savings analysis
```

Each step uses GLM 5.1 with function calling (agentic loop, up to 10 tool iterations). Results stream to the browser in real-time via SSE.

## Deployment

### Frontend (Vercel)

The frontend deploys automatically on Vercel. Configuration is in `vercel.json`:

- Build command: `pnpm --filter web build`
- Output directory: `apps/web/.next`
- Framework: Next.js

### Backend (Railway)

The backend deploys via Docker on Railway. Configuration is in `railway.toml`:

- Dockerfile: `apps/api/Dockerfile`
- Health check: `GET /health`
- Auto-restart on failure (max 3 retries)

Set these environment variables in Railway:
- `ZAI_API_KEY`
- `GLM_MODEL`
- `DATABASE_URL` (auto-provisioned by Railway PostgreSQL)
- `CORS_ORIGIN` (your Vercel frontend URL)

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in watch mode |
| `pnpm build` | Build all apps |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Type-check all packages |

### Backend-specific

```bash
cd apps/api
pnpm test          # Run unit tests
pnpm test:watch    # Watch mode
pnpm test:cov      # Coverage report
pnpm test:e2e      # End-to-end tests
```

## Architecture Decisions

- **SSE over WebSockets** — Simpler protocol for unidirectional progress streaming; no connection upgrade complexity
- **Agentic tool calling** — Each analysis step uses LLM function calling with database-backed tools for accurate tariff data
- **Monorepo with shared types** — TypeScript types shared between frontend and backend via `@tariffpilot/shared`
- **Anonymous sessions** — No auth required; client-side CUID stored in localStorage for session continuity
- **Multi-stage Docker builds** — Optimized production images with only runtime dependencies

## License

MIT
