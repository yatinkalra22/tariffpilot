# TariffPilot — Complete Setup Guide

This guide walks you through obtaining every API key and service credential needed to run TariffPilot locally and in production.

---

## Table of Contents

1. [Z.AI API Key (GLM 5.1)](#1-zai-api-key-glm-51)
2. [PostgreSQL Database](#2-postgresql-database)
3. [Environment File Configuration](#3-environment-file-configuration)
4. [Database Migrations](#4-database-migrations)
5. [Deployment Keys](#5-deployment-keys)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Z.AI API Key (GLM 5.1)

TariffPilot uses the **GLM 5.1** large language model via the Z.AI platform. This is the only paid API key required.

### Steps to get your key

1. Go to [https://open.bigmodel.cn](https://open.bigmodel.cn)
2. Click **Register** (or **Sign Up**) in the top right
3. Create an account using your email or phone number
4. After registration, verify your email/phone
5. Log in to the dashboard
6. Navigate to **API Keys** in the left sidebar (or go to [https://open.bigmodel.cn/usercenter/apikeys](https://open.bigmodel.cn/usercenter/apikeys))
7. Click **Create API Key**
8. Copy the generated key — it starts with a long alphanumeric string

### Important notes

- The Z.AI platform is by **Zhipu AI** (智谱AI), the company behind GLM models
- New accounts typically get **free credits** for testing
- The API is OpenAI-compatible — TariffPilot uses the OpenAI SDK pointed at `https://api.z.ai/api/paas/v4/`
- The model used is `glm-5-1` (configurable via `GLM_MODEL` env var)
- Keep your API key secret — never commit it to git

### Pricing

- Check current pricing at [https://open.bigmodel.cn/pricing](https://open.bigmodel.cn/pricing)
- GLM 5.1 is billed per token (input + output)
- A typical TariffPilot analysis uses ~5,000-10,000 tokens across all 5 steps

---

## 2. PostgreSQL Database

TariffPilot stores HTS codes, analysis results, and session data in PostgreSQL.

### Option A: Local PostgreSQL (Development)

**macOS (Homebrew):**

```bash
# Install PostgreSQL
brew install postgresql@15

# Start the service
brew services start postgresql@15

# Create the database
createdb tariffpilot

# Your connection URL
# DATABASE_URL=postgresql://$(whoami)@localhost:5432/tariffpilot
```

**macOS (Postgres.app):**

1. Download from [https://postgresapp.com](https://postgresapp.com)
2. Install and open the app
3. Click **Initialize** to start the server
4. Open the built-in terminal and run: `CREATE DATABASE tariffpilot;`
5. Connection URL: `postgresql://localhost:5432/tariffpilot`

**Docker:**

```bash
docker run -d \
  --name tariffpilot-db \
  -e POSTGRES_DB=tariffpilot \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15

# Connection URL:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tariffpilot
```

### Option B: Railway PostgreSQL (Production)

1. Go to [https://railway.app](https://railway.app) and sign in with GitHub
2. In your project, click **+ New** → **Database** → **Add PostgreSQL**
3. Once provisioned, click the PostgreSQL service
4. Go to the **Variables** tab
5. Copy the `DATABASE_URL` value — it looks like:
   ```
   postgresql://postgres:xxxx@xxx.railway.internal:5432/railway
   ```
6. Railway automatically injects this into your backend service if they're in the same project

---

## 3. Environment File Configuration

### Backend (`apps/api/.env`)

```bash
# Copy the example file
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env` with your actual values:

```env
# Z.AI API Key (from Step 1)
ZAI_API_KEY=your_actual_api_key_here

# GLM model version
GLM_MODEL=glm-5-1

# PostgreSQL connection (from Step 2)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tariffpilot

# CORS — must match your frontend URL
CORS_ORIGIN=http://localhost:3001

# Server port
PORT=3000
```

### Frontend (`apps/web/.env.local`)

```bash
# Create the file
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > apps/web/.env.local
```

For production, set this to your deployed backend URL (e.g., `https://your-app.railway.app`).

---

## 4. Database Migrations

After configuring your database URL:

```bash
cd apps/api

# Run migrations to create tables
npx prisma migrate deploy

# (Optional) Verify tables were created
npx prisma studio
```

This creates three tables: `HtsCode`, `Analysis`, and `AdcvdOrder`.

---

## 5. Deployment Keys

### Vercel (Frontend Hosting)

1. Go to [https://vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New Project** → Import your TariffPilot repo
3. Set the **Root Directory** to `apps/web`
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = your Railway backend URL
5. Deploy

No API key needed — Vercel connects directly via GitHub.

### Railway (Backend Hosting)

1. Go to [https://railway.app](https://railway.app) and sign in with GitHub
2. Click **New Project** → **Deploy from GitHub Repo**
3. Select your TariffPilot repository
4. Set the **Root Directory** to `/` (Railway uses the Dockerfile at `apps/api/Dockerfile`)
5. Add environment variables:
   - `ZAI_API_KEY` = your Z.AI key
   - `GLM_MODEL` = `glm-5-1`
   - `CORS_ORIGIN` = your Vercel frontend URL
   - `DATABASE_URL` = auto-injected if PostgreSQL is in the same project
6. Deploy

Railway provides a free tier with $5/month credit for hobby projects.

---

## 6. Troubleshooting

### "Invalid API key" error

- Verify your `ZAI_API_KEY` is correct in `apps/api/.env`
- Ensure there are no extra spaces or quotes around the key
- Check your Z.AI account is active at [https://open.bigmodel.cn](https://open.bigmodel.cn)

### Database connection refused

- Ensure PostgreSQL is running: `brew services list` or `docker ps`
- Verify the `DATABASE_URL` format: `postgresql://user:password@host:port/database`
- Check the database exists: `psql -l | grep tariffpilot`

### CORS errors in browser

- Ensure `CORS_ORIGIN` in backend `.env` matches your frontend URL exactly
- Include the protocol: `http://localhost:3001` not `localhost:3001`
- No trailing slash: `http://localhost:3001` not `http://localhost:3001/`

### Prisma migration fails

- Ensure `DATABASE_URL` is set before running migrations
- Check PostgreSQL user has CREATE permission on the database
- Try resetting: `npx prisma migrate reset` (warning: deletes all data)

### Frontend can't reach backend

- Verify `NEXT_PUBLIC_API_URL` points to the correct backend URL
- Check the backend is running: `curl http://localhost:3000/health`
- For production, ensure Railway service is deployed and healthy

---

## Quick Reference

| Variable | Where | Required | How to Get |
|----------|-------|----------|------------|
| `ZAI_API_KEY` | Backend `.env` | Yes | [Z.AI Dashboard](https://open.bigmodel.cn/usercenter/apikeys) |
| `GLM_MODEL` | Backend `.env` | No (default: `glm-5`) | Set to `glm-5-1` |
| `DATABASE_URL` | Backend `.env` | Yes | Local PostgreSQL or Railway |
| `CORS_ORIGIN` | Backend `.env` | No (default: `localhost:3001`) | Your frontend URL |
| `PORT` | Backend `.env` | No (default: `3000`) | Any available port |
| `NEXT_PUBLIC_API_URL` | Frontend `.env.local` | Yes | Your backend URL |
