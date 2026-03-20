# Testing Patterns

**Analysis Date:** 2026-03-20

## Test Framework

**Runner:**
- No test framework installed or configured
- No test runner dependencies in `package.json`
- No test configuration files (no `jest.config.*`, `vitest.config.*`, or `playwright.config.*`)
- No `"test"` script in `package.json`
- `.gitignore` includes `/coverage` directory, indicating tests are anticipated

**Assertion Library:**
- Not configured

**Run Commands:**
```bash
# No test commands defined yet
# Current package.json scripts: dev, build, start, lint
```

## Current State

This is an early-stage project with no test infrastructure. Source files:
- `src/app/layout.tsx` - Root layout (Next.js scaffold)
- `src/app/page.tsx` - Homepage (Next.js scaffold)
- `src/lib/db.ts` - Prisma client singleton
- `prisma/schema.prisma` - Database schema (10 models, 6 enums)
- `src/generated/prisma/` - Generated Prisma client (git-ignored)

No test files, no application logic, no Server Actions, no API routes, and no custom components exist yet. The only verification currently available is:

```bash
npx prisma generate && next build    # Type checking and compilation
npx eslint .                         # Linting (replaces next lint in Next.js 16)
```

## Recommended Test Setup

Based on the stack (Next.js 16.2, React 19, TypeScript strict, Prisma 7.5), the recommended test infrastructure follows.

### Unit/Integration Testing

**Recommended Runner:** Vitest
- Native ESM support (aligns with `"module": "esnext"` in `tsconfig.json`)
- Built-in TypeScript support without additional transforms
- Compatible with React Testing Library and Next.js App Router patterns
- Faster execution than Jest with Vite's module resolution

**Install:**
```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

**Config:** Create `vitest.config.ts` at project root:
```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

**Setup file:** Create `src/test/setup.ts`:
```typescript
import "@testing-library/jest-dom/vitest";
```

**Add scripts to `package.json`:**
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

### E2E Testing

**Recommended Framework:** Playwright
- Official Next.js recommendation for E2E testing
- Multi-browser support (Chromium, Firefox, WebKit)
- Supports testing Server Components and full page rendering

**Install:**
```bash
npm install -D @playwright/test
npx playwright install
```

## Test File Organization

**Location:** Co-locate test files next to the code they test

**Naming:**
- Unit/integration: `*.test.ts` or `*.test.tsx`
- E2E: `*.e2e.ts` in `e2e/` directory at project root

**Recommended Structure:**
```
src/
├── app/
│   ├── page.tsx
│   └── page.test.tsx              # Page component tests (if needed)
├── components/
│   ├── ProviderCard.tsx
│   └── ProviderCard.test.tsx      # Component tests
├── lib/
│   ├── db.ts
│   ├── queries/
│   │   ├── providers.ts
│   │   └── providers.test.ts      # Query function tests
│   └── utils/
│       ├── format.ts
│       └── format.test.ts         # Utility tests
└── test/
    ├── setup.ts                   # Global test setup
    ├── helpers.ts                 # Shared test utilities
    └── fixtures/                  # Test data factories
        ├── providers.ts
        ├── plans.ts
        └── reviews.ts
e2e/
├── home.e2e.ts                    # E2E: homepage flows
├── category.e2e.ts                # E2E: category browsing + filtering
├── provider.e2e.ts                # E2E: provider detail page
└── compare.e2e.ts                 # E2E: comparison tool
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("ComponentOrModule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when specific condition", () => {
    it("should expected behavior", () => {
      // Arrange
      const input = createTestData();

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

**Patterns:**
- Use `describe` blocks to group related tests
- Use descriptive `it` names that read as sentences
- Follow Arrange-Act-Assert pattern
- Use `beforeEach` with `vi.clearAllMocks()` to reset mock state
- One assertion per test when practical

## Mocking

**Framework:** Vitest built-in (`vi.mock`, `vi.fn`, `vi.spyOn`, `vi.mocked`)

**Prisma Mocking Pattern:**
```typescript
import { vi } from "vitest";
import type { PrismaClient } from "@/generated/prisma/client";

// Mock the Prisma client singleton
vi.mock("@/lib/db", () => ({
  prisma: {
    provider: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    plan: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    review: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    blogPost: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    // Add models as needed
  } as unknown as PrismaClient,
}));
```

**Next.js Navigation Mocking:**
```typescript
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  usePathname: vi.fn(() => "/"),
  notFound: vi.fn(),
  redirect: vi.fn(),
}));
```

**Next.js Image Mocking:**
```typescript
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    return <img {...props} alt={props.alt as string} />;
  },
}));
```

**What to Mock:**
- Database calls (Prisma client methods via `@/lib/db`)
- External API calls
- Next.js navigation functions (`redirect`, `notFound`)
- `cookies()`, `headers()` (async in Next.js 16)
- Environment variables (`vi.stubEnv`)

**What NOT to Mock:**
- Pure utility functions (test their actual logic)
- React component rendering behavior (use Testing Library)
- Prisma-generated types (use real types for type safety)
- URL search param parsing logic (test actual behavior)
- Tailwind CSS class application

## Fixtures and Factories

**Test Data Pattern:**
```typescript
// src/test/fixtures/providers.ts
import type { Provider } from "@/generated/prisma/client";

export function buildProvider(overrides: Partial<Provider> = {}): Provider {
  return {
    id: "cltest123",
    name: "Test Meal Kit",
    slug: "test-meal-kit",
    description: "A test provider for unit testing",
    shortDescription: "Test provider",
    website: "https://example.com",
    affiliateUrl: null,
    logoUrl: null,
    heroImageUrl: null,
    foundedYear: 2020,
    headquarters: "New York, NY",
    deliveryAreaDescription: "Continental US",
    averageRating: 4.5,
    reviewCount: 10,
    prosJson: '["Fresh ingredients","Easy recipes"]',
    consJson: '["Higher price point"]',
    editorNote: null,
    featured: false,
    active: true,
    metaTitle: null,
    metaDescription: null,
    category: "MEAL_KIT",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}
```

```typescript
// src/test/fixtures/plans.ts
import type { Plan } from "@/generated/prisma/client";

export function buildPlan(overrides: Partial<Plan> = {}): Plan {
  return {
    id: "clplan123",
    providerId: "cltest123",
    name: "Classic Plan",
    description: "Our most popular plan",
    pricePerServing: 8.99,
    pricePerWeek: 59.94,
    pricePerBox: null,
    shippingCost: 0,
    shippingNote: "Free shipping",
    servingsPerMeal: 2,
    mealsPerWeek: 3,
    frequency: "WEEKLY",
    minimumOrder: null,
    canSkip: true,
    canCancel: true,
    cancelPolicy: "Cancel anytime",
    featured: true,
    active: true,
    sortOrder: 0,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}
```

```typescript
// src/test/fixtures/reviews.ts
import type { Review } from "@/generated/prisma/client";

export function buildReview(overrides: Partial<Review> = {}): Review {
  return {
    id: "clreview123",
    providerId: "cltest123",
    authorName: "Jane Doe",
    authorEmail: "jane@example.com",
    rating: 5,
    title: "Great meal kit!",
    body: "Loved the recipes and fresh ingredients.",
    status: "APPROVED",
    helpful: 3,
    createdAt: new Date("2026-01-15"),
    updatedAt: new Date("2026-01-15"),
    ...overrides,
  };
}
```

**Factory Naming Convention:**
- Use `build*` prefix for factory functions (e.g., `buildProvider`, `buildPlan`, `buildReview`)
- Accept `Partial<Model>` for overrides
- Return complete typed objects matching Prisma model shapes

**Location:**
- `src/test/fixtures/` for shared test data factories
- One file per model (e.g., `providers.ts`, `plans.ts`, `reviews.ts`)

## Coverage

**Requirements:** None enforced currently

**Recommended Targets:**
- Utility/library code (`src/lib/`): 90%+ line coverage
- Server Actions (`src/app/actions/`): 80%+ (critical business logic)
- Components (`src/components/`): 70%+ (focus on behavior, not line coverage)
- Pages: Covered primarily by E2E tests

**View Coverage:**
```bash
npx vitest run --coverage
```

## Test Types

**Unit Tests:**
- Scope: Individual functions, utilities, data transformations, JSON-LD generators
- Location: Co-located as `*.test.ts`
- Mock: Database calls
- Examples: query helpers in `src/lib/`, URL param parsing, price formatting, slug generation

**Integration Tests:**
- Scope: Component rendering with mocked data, Server Action behavior
- Location: Co-located as `*.test.tsx`
- Mock: Prisma client
- Examples: Page components rendering with mock provider data, form submissions via Server Actions

**E2E Tests:**
- Framework: Playwright (recommended, not yet installed)
- Scope: Full user flows across multiple pages
- Location: `e2e/` directory at project root
- Examples: Browse category -> filter by dietary tag -> view provider detail -> submit review

## Common Patterns

**Async Server Component Testing:**
```typescript
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { prisma } from "@/lib/db";
import ProviderPage from "@/app/providers/[slug]/page";
import { buildProvider } from "@/test/fixtures/providers";

vi.mock("@/lib/db");

it("renders provider detail page", async () => {
  vi.mocked(prisma.provider.findUnique).mockResolvedValue(
    buildProvider({ name: "HelloFresh", slug: "hellofresh" })
  );

  // Server Components are async -- await before rendering
  const Component = await ProviderPage({
    params: Promise.resolve({ slug: "hellofresh" }),
  });
  render(Component);

  expect(screen.getByText("HelloFresh")).toBeInTheDocument();
});
```

**Error / Not Found Testing:**
```typescript
import { notFound } from "next/navigation";

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

it("calls notFound when provider does not exist", async () => {
  vi.mocked(prisma.provider.findUnique).mockResolvedValue(null);

  await ProviderPage({
    params: Promise.resolve({ slug: "nonexistent" }),
  });

  expect(notFound).toHaveBeenCalled();
});
```

**Search Params / Filter Testing:**
```typescript
it("applies dietary filter from URL search params", async () => {
  vi.mocked(prisma.provider.findMany).mockResolvedValue([
    buildProvider({ name: "Purple Carrot" }),
  ]);

  const Component = await CategoryPage({
    params: Promise.resolve({ category: "meal-kits" }),
    searchParams: Promise.resolve({ dietary: "VEGAN" }),
  });
  render(Component);

  expect(prisma.provider.findMany).toHaveBeenCalledWith(
    expect.objectContaining({
      where: expect.objectContaining({
        dietaryTags: expect.objectContaining({
          some: { tag: "VEGAN" },
        }),
      }),
    })
  );
});
```

**Server Action Testing:**
```typescript
import { submitReview } from "@/app/actions/reviews";

it("creates a review and returns success", async () => {
  vi.mocked(prisma.review.create).mockResolvedValue(
    buildReview({ id: "new-review" })
  );

  const formData = new FormData();
  formData.set("providerId", "cltest123");
  formData.set("authorName", "Jane Doe");
  formData.set("rating", "5");
  formData.set("body", "Great service!");

  const result = await submitReview(formData);

  expect(result.success).toBe(true);
  expect(prisma.review.create).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({
        providerId: "cltest123",
        authorName: "Jane Doe",
        rating: 5,
      }),
    })
  );
});
```

## Key Testing Considerations for This Stack

**Next.js 16 Async Params:**
- All test calls to page/layout components must pass `params` and `searchParams` as Promises
- Use `Promise.resolve(...)` in test invocations

**Server Components:**
- Server Components are async functions that return JSX
- Await the component call before passing result to `render()`
- Extract data-fetching logic into separate functions in `src/lib/` for easier unit testing

**Prisma Generated Types:**
- Import types from `@/generated/prisma/client` for type-safe test fixtures
- Regenerate client (`npx prisma generate`) if schema changes cause fixture type errors

**Build as Verification:**
- Until test infrastructure is set up, `npx prisma generate && next build` serves as the primary verification that code compiles and types check

---

*Testing analysis: 2026-03-20*
