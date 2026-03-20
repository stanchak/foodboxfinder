@AGENTS.md

# FoodBoxFinder Project

## Planning
- Project spec: `.planning/PROJECT.md`
- Roadmap: `.planning/ROADMAP.md`
- Phase plans go in `.planning/phases/XX/PLAN.md`

## Conventions
- All pages are Server Components by default. Use "use client" only for interactive UI (filters, modals, mobile nav).
- Data fetching happens in Server Components via Prisma. Never expose Prisma to client components.
- URL search params drive filter/sort state on listing pages. Keep URLs shareable.
- All public pages must have metadata (title, description) and JSON-LD structured data.
- Slugs are the canonical identifier for SEO URLs.
- Use `src/lib/db.ts` for the Prisma client singleton.
- Keep components in `src/components/` with flat structure unless a component group needs isolation.
- Server Actions go in `src/app/actions/` or colocated with the form.
- Admin routes live under `src/app/admin/` and are protected by `proxy.ts` (NOT middleware.ts — renamed in Next.js 16).
- `params` and `searchParams` are Promises in Next.js 16 — always `await` them.

## Database
- Run `npx prisma db push` to sync schema to Neon (no migration files for now).
- Run `npx prisma generate` to regenerate the client after schema changes.
- Seed script: `prisma/seed.ts` — run with `npx tsx prisma/seed.ts`.

## Agent Delegation
When working on this project, delegate to specialist agents:
- **agency-backend-architect**: Database queries, API routes, Server Actions, data modeling
- **agency-frontend-developer**: React components, pages, layouts, client interactivity
- **agency-ui-designer**: Visual design decisions, component styling, color/typography
- **agency-ux-researcher**: User flows, information architecture, usability concerns
- **agency-accessibility-auditor**: WCAG compliance, screen reader testing, keyboard nav
- **agency-security-engineer**: Input validation, XSS prevention, admin auth
