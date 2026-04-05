# TariffPilot AI

**AI-powered US tariff classification and duty calculation platform.** Instantly analyze products against the Harmonized Tariff Schedule, calculate multi-layer duty stacks, and compare sourcing costs across 8 countries.

Built with GLM 5.1 (via Z.AI), NestJS, Next.js 16, and PostgreSQL.

---

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
CORS_ORIGIN=http://localhost:3001
PORT=3000
```

**Frontend** — create the web environment file:

```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > apps/web/.env.local
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
| Frontend | http://localhost:3001 |
| Backend API | http://localhost:3000 |
| Health Check | http://localhost:3000/health |

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
