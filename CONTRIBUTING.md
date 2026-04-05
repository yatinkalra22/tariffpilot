# Contributing to TariffPilot

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `pnpm install`
3. Set up environment variables (see [README.md](README.md#environment-setup))
4. Run database migrations: `cd apps/api && npx prisma migrate deploy`
5. Start development: `pnpm dev`

## Project Layout

This is a **pnpm monorepo** managed by Turborepo:

- `apps/api` — NestJS backend (port 3000)
- `apps/web` — Next.js frontend (port 3001)
- `packages/shared` — Shared TypeScript types

## Code Style

- **TypeScript** is required for all code
- **ESLint** and **Prettier** are configured in each app
- Run `pnpm lint` before submitting changes

## Branch Naming

```
feature/short-description
fix/short-description
docs/short-description
```

## Commit Messages

Use conventional commits:

```
feat: add new duty calculation layer
fix: correct MPF bounds calculation
docs: update API reference
refactor: simplify SSE streaming logic
```

## Pull Requests

1. Create a feature branch from `main`
2. Make your changes with clear, focused commits
3. Ensure `pnpm build` and `pnpm lint` pass
4. Run tests: `cd apps/api && pnpm test`
5. Open a PR with a description of what changed and why

## Database Changes

- Modify `apps/api/prisma/schema.prisma`
- Generate a migration: `npx prisma migrate dev --name describe_change`
- Never edit existing migrations manually

## Adding API Endpoints

1. Create or update the relevant module in `apps/api/src/`
2. Add shared types to `packages/shared/src/types/`
3. Update the frontend API helpers in `apps/web/src/lib/api.ts`

## Reporting Issues

Open an issue with:
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, browser)
