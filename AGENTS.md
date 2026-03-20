<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# FoodBoxFinder Agent Guidelines

## Project Context
FoodBoxFinder is a food box subscription discovery/comparison site. See `.planning/PROJECT.md` for full spec and `.planning/ROADMAP.md` for the phased delivery plan.

## Tech Stack
- Next.js 16.2 (App Router, Server Components)
- React 19, Tailwind CSS 4
- Prisma 7.5 + Neon PostgreSQL
- TypeScript strict mode
- Vercel hosting

## Rules for All Agents
1. Read the Next.js 16 docs in `node_modules/next/dist/docs/01-app/` before using any Next.js API you're unsure about.
2. Server Components are the default. Only add "use client" when the component needs browser APIs, event handlers, or React hooks (useState, useEffect, etc.).
3. All database access goes through the Prisma client in `src/lib/db.ts`. Never import Prisma in client components.
4. Every public page needs: `export const metadata` or `generateMetadata()`, plus JSON-LD structured data.
5. Use TypeScript strictly — no `any` types, no `@ts-ignore`.
6. Tailwind CSS 4 for styling. No CSS modules, no styled-components.
7. Follow the URL structure defined in PROJECT.md AD-2.
8. Keep components small and focused. Extract reusable pieces into `src/components/`.
9. Use semantic HTML (nav, main, article, section, aside, etc.) for accessibility.
10. Test that `next build` passes after making changes.
