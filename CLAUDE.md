# CLAUDE.md — Project Operating Manual

## Project Overview
<!-- CUSTOMIZE: Brief description of what this project does -->
Project Name: fire-calculator
Tech Stack: Next.js 15 + TypeScript + Tailwind CSS + Supabase
Deployment: Vercel

## Architecture
<!-- CUSTOMIZE: Describe your app's architecture -->
- `/src/app/` — Next.js App Router pages and layouts
- `/src/components/` — Reusable React components
- `/src/lib/` — Utility functions, API clients, constants
- `/src/hooks/` — Custom React hooks
- `/src/types/` — TypeScript type definitions
- `/src/services/` — Business logic and external API integrations
- `/supabase/` — Database migrations and seed data

## Model Usage Policy

### Opus (Staff Engineer) — Use sparingly, max 15% of work
- Architecture decisions and system design
- Security reviews and code audits
- Complex multi-file debugging sessions
- Final review before major releases
- DO NOT use for routine implementation

### Sonnet (Senior SDE) — Default for all work, 70%
- Feature implementation
- Writing and running tests
- API integrations and refactoring
- Documentation
- Bug fixes and debugging

### Haiku (Junior Dev) — Simple tasks, 15%
- File formatting and cleanup
- Bulk simple edits (renaming, headers)
- Quick syntax lookups
- Commit message generation

## Coding Conventions

### TypeScript
- Strict mode enabled, no `any` types — use `unknown` + type guards
- Prefer `interface` over `type` for object shapes
- Use named exports, not default exports (except pages)
- All functions must have explicit return types
- Use `const` by default, `let` only when mutation is needed

### React / Next.js
- Functional components only, no class components
- Use server components by default, `'use client'` only when needed
- Colocate component files: `ComponentName/index.tsx` + `ComponentName.test.tsx`
- Keep components under 150 lines — extract when larger
- Use Tailwind for all styling — no CSS modules, no styled-components
- shadcn/ui for UI primitives when available

### API & Data
- All API routes in `/src/app/api/` with proper error handling
- Use Zod for all input validation
- Supabase client via `@/lib/supabase` (never import directly)
- Always handle loading, error, and empty states

### Testing
- Test files colocated next to source: `*.test.ts` / `*.test.tsx`
- Use Vitest for unit tests, Playwright for E2E
- Test behavior, not implementation
- Minimum: test all API routes, business logic, and critical user flows
- Run `npm test` before every commit

### Git Conventions
- Commit format: `<type>(<scope>): <description>`
- Types: feat, fix, refactor, docs, test, chore, style, perf
- Keep commits atomic — one logical change per commit
- Branch naming: `feat/description`, `fix/description`, `chore/description`

## Error Handling
- All async functions must have try/catch
- API routes return proper HTTP status codes with typed error responses
- Log errors server-side with context (don't expose internals to client)
- User-facing errors must be friendly and actionable

## Performance Rules
- No unnecessary client-side JavaScript — server components first
- Images: always use next/image with proper sizing
- Dynamic imports for heavy components below the fold
- Database queries: always use indexes, avoid N+1

## Known Gotchas & Learnings
<!-- This section grows over time. Add entries when Claude makes a mistake. -->
<!-- Format: - YYYY-MM-DD: Description of issue and correct approach -->

## Commands Reference
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm test` — Run all tests
- `npm run test:e2e` — Run Playwright E2E tests
- `npm run lint` — Run ESLint
- `npm run format` — Run Prettier
