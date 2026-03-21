# Testing Patterns

**Analysis Date:** 2026-03-21

## Test Framework

**Runner:** None installed.

No test framework (Jest, Vitest, or Playwright) is present in `package.json`. No test configuration files exist (no `jest.config.*`, `vitest.config.*`, or `playwright.config.*`).

**Run Commands:**
```bash
# No test commands available
# npx eslint .    # Only code quality check available
# npx tsc --noEmit  # Type checking only
```

## Test File Organization

**Location:** No test files exist in the codebase.

**Pattern:** Not established. No `*.test.*` or `*.spec.*` files detected anywhere in the project.

## What Exists Instead of Tests

**Type safety** (enforced at build time):
- TypeScript strict mode (`"strict": true` in `tsconfig.json`)
- Prisma-generated types consumed throughout the codebase
- No `any` types allowed by convention

**Build verification:**
- `prisma generate && next build` is the sole automated quality gate
- Vercel deployment implicitly validates that the build succeeds

**Manual validation:**
- Seed script (`prisma/seed.ts`) functions as integration verification — running it confirms database schema and data model are consistent

**Input validation (runtime, not tests):**
- Server Actions validate all FormData before database writes (see `src/app/actions/reviews.ts` and `src/app/actions/admin.ts`)
- URL search params parsed and sanitized with local helpers (see `src/app/[category]/page.tsx` → `parseSearchParams()`)
- `proxy.ts` validates admin cookie before all `/admin/*` routes

## Coverage

**Requirements:** None enforced. No coverage tooling installed.

**Risk areas without test coverage:**
- `src/lib/format.ts` — pure functions (`formatPrice`, `formatPriceRange`, `formatPriceLabel`, `dollarsToCents`) that are straightforward unit test candidates
- `src/lib/categories.ts` — `getCategoryBySlug()` bidirectional mapping logic
- `src/app/actions/reviews.ts` — `submitReview` validation branches (honeypot, rate limiting, field validation)
- `src/app/actions/admin.ts` — all CRUD action validation and mutation logic
- `src/app/[category]/page.tsx` → `parseSearchParams()` — URL param sanitization with edge cases
- `src/components/CompareProvider.tsx` — `parseEntries()` JSON parsing and `useSyncExternalStore` integration

## Test Types

**Unit Tests:** Not used.
**Integration Tests:** Not used.
**E2E Tests:** Not used.

## Adding Tests (Recommended Approach)

When a test framework is added, the following patterns align with this codebase's style:

**Recommended framework:** Vitest (matches ESM, TypeScript strict mode, no CJS configuration needed)

**Install:**
```bash
npm install -D vitest @vitest/ui
```

**Suggested config (`vitest.config.ts`):**
```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
```

**Suggested test file location:** Co-located with source:
```
src/lib/format.test.ts
src/lib/categories.test.ts
src/app/actions/reviews.test.ts
```

**Pattern for pure utility functions (`src/lib/format.ts`):**
```typescript
import { describe, it, expect } from "vitest";
import { formatPrice, formatPriceRange, formatPriceLabel, dollarsToCents } from "@/lib/format";

describe("formatPrice", () => {
  it("formats cents to dollar string", () => {
    expect(formatPrice(799)).toBe("$7.99");
  });

  it("returns N/A for null", () => {
    expect(formatPrice(null)).toBe("N/A");
  });

  it("handles zero", () => {
    expect(formatPrice(0)).toBe("$0.00");
  });
});
```

**Pattern for Server Action validation (requires mocking):**
```typescript
import { describe, it, expect, vi } from "vitest";

// Mock Prisma before importing the action
vi.mock("@/lib/db", () => ({ prisma: { review: { count: vi.fn(), create: vi.fn() }, provider: { findUnique: vi.fn() } } }));
vi.mock("next/headers", () => ({ headers: vi.fn(() => ({ get: vi.fn() })) }));

import { submitReview } from "@/app/actions/reviews";

describe("submitReview", () => {
  it("returns error when rating is missing", async () => {
    const formData = new FormData();
    formData.set("providerId", "test-id");
    formData.set("body", "Great service overall!");
    formData.set("authorName", "Jane");

    const result = await submitReview({ success: false, message: "", errors: {} }, formData);
    expect(result.success).toBe(false);
    expect(result.errors.rating).toBeDefined();
  });
});
```

**What NOT to mock:**
- Pure utility functions (`format.ts`, `categories.ts`) — test directly
- URL parsing helpers — test directly with plain objects

**What to mock:**
- `@/lib/db` — Prisma client (avoid real database in unit tests)
- `next/headers`, `next/cache`, `next/navigation` — Next.js server-side APIs

## Priority Test Coverage (by risk)

| Area | File | Risk | Priority |
|------|------|------|----------|
| Price formatting | `src/lib/format.ts` | Displayed to users, data integrity | High |
| Category slug mapping | `src/lib/categories.ts` | Drives all SEO URLs | High |
| Review submission validation | `src/app/actions/reviews.ts` | User-facing form, spam protection | High |
| Admin Server Actions | `src/app/actions/admin.ts` | CMS data integrity | High |
| URL param parsing | `src/app/[category]/page.tsx` | Filter correctness, no bad data to DB | Medium |
| JSON parsing in providers | `src/app/providers/[slug]/page.tsx` → `parseJsonArray()` | Graceful handling of bad stored data | Medium |
| CompareProvider logic | `src/components/CompareProvider.tsx` | sessionStorage parse, dedup, max limit | Medium |

---

*Testing analysis: 2026-03-21*
