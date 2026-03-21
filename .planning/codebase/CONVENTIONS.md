# Coding Conventions

**Analysis Date:** 2026-03-21

## Naming Patterns

**Files:**
- Next.js App Router pages: `page.tsx` (e.g., `src/app/providers/[slug]/page.tsx`)
- Next.js layouts: `layout.tsx` (e.g., `src/app/admin/layout.tsx`)
- Next.js special files: `error.tsx`, `not-found.tsx`, `loading.tsx`, `global-error.tsx`
- Shared components: `PascalCase.tsx` (e.g., `ProviderCard.tsx`, `ReviewForm.tsx`, `CompareBar.tsx`)
- Admin-specific components: colocated in `src/components/admin/` subdirectory (e.g., `ProviderForm.tsx`, `PlanManager.tsx`)
- Server Actions files: `camelCase.ts` in `src/app/actions/` (e.g., `reviews.ts`, `admin.ts`)
- Library/utility modules: `camelCase.ts` (e.g., `db.ts`, `format.ts`, `categories.ts`, `queries.ts`)
- Config files: `camelCase.config.ts` or `camelCase.config.mjs` (e.g., `next.config.ts`, `eslint.config.mjs`, `prisma.config.ts`)

**Functions and Variables:**
- React components: `PascalCase` function declarations (not arrow functions): `export default function ProviderCard(...)`
- Utility/helper functions: `camelCase` (e.g., `formatPrice`, `getCategoryBySlug`, `parseSearchParams`)
- Server Actions: `camelCase` with action verb prefix (e.g., `submitReview`, `createProvider`, `updateBlogPost`, `deleteCollection`)
- Custom hooks: `camelCase` with `use` prefix (e.g., `useCompare`)
- Local variables and constants: `camelCase` (e.g., `geistSans`, `featuredProviders`, `orderByMap`)
- Environment variables: `UPPER_SNAKE_CASE` (e.g., `DATABASE_URL`, `ADMIN_SECRET`, `NODE_ENV`)
- Module-level constants: `UPPER_SNAKE_CASE` for semantic sets (e.g., `CATEGORY_MAP`, `VALID_SORT_VALUES`, `MAX_COMPARE`, `STORAGE_KEY`)

**Types and Interfaces:**
- Interface names: `PascalCase` (e.g., `ReviewFormErrors`, `ReviewFormState`, `AdminFormState`, `CompareEntry`, `CompareContextValue`, `ProviderCardData`)
- Type aliases: `PascalCase` (e.g., `SortOption`)
- Prisma-generated types imported from `@/generated/prisma/client`

**Prisma Schema:**
- Models: `PascalCase` (e.g., `Provider`, `Plan`, `BlogPost`)
- Fields: `camelCase` (e.g., `providerId`, `averageRating`, `pricePerServing`)
- Enum type names: `PascalCase` (e.g., `CategoryType`, `DietaryTag`, `PlanFrequency`)
- Enum values: `UPPER_SNAKE_CASE` (e.g., `MEAL_KIT`, `GLUTEN_FREE`, `WEEKLY`)

## Code Style

**Formatting:**
- No formatter (Prettier or Biome) configured
- 2-space indentation in all files
- Double quotes for all strings (imports, JSX attributes, string values)
- Semicolons at end of statements
- Trailing commas in multi-line objects, arrays, function parameters
- Template literals for dynamic class composition in JSX

**Linting:**
- ESLint 9 flat config: `eslint.config.mjs`
- Extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Run with: `npx eslint .` (NOT `next lint` — removed in Next.js 16)
- Global ignores: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`

**TypeScript:**
- Strict mode enabled (`"strict": true` in `tsconfig.json`)
- No `any` types allowed
- No `@ts-ignore` allowed
- Use type narrowing with type predicates (e.g., `(item): item is string => typeof item === "string"`)
- Non-null assertion (`!`) only for required env vars: `process.env.DATABASE_URL!`

## Import Organization

**Path Aliases:**
- `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- `@/generated/prisma/client` — Prisma client types and enums
- `@/lib/db` — database singleton
- `@/lib/queries` — all query functions
- `@/lib/categories` — slug/enum mapping utilities
- `@/lib/format` — price formatting utilities
- `@/components/` — shared components

**Import Types:**
- Always use `import type` for type-only imports: `import type { Metadata } from "next"`
- Use `import type { CategoryType, DietaryTag } from "@/generated/prisma/client"`
- Mix type and value imports with `import { cache } from "react"` and `import type { ... }` on separate lines

**Typical import order (observed pattern):**
1. Next.js framework imports (`next/navigation`, `next/cache`, `next/headers`)
2. React and external library imports
3. Internal type imports (`import type { ... } from "@/..."`)
4. Internal value imports (`import { ... } from "@/..."`)
5. Component imports

**Server-only enforcement:**
- `src/lib/queries.ts` starts with `import "server-only"` to prevent client-side import
- Never import `@/lib/db` or `@/lib/queries` in client components

## Component Patterns

**Server Components (default):**
```typescript
// Page with params and metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  // ...
}

export default async function ProviderDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // fetch data directly via query functions
  const provider = await getProviderBySlug(slug);
  if (!provider) notFound();
  // ...
}
```

**Client Components:**
```typescript
"use client";  // Must be the very first line

export default function ReviewForm({
  providerId,
}: Readonly<{
  providerId: string;
}>) {
  const [state, formAction, isPending] = useActionState(submitReview, initialState);
  // ...
}
```

**Props pattern:**
- Always wrap props in `Readonly<{}>`: `Readonly<{ children: React.ReactNode; color?: keyof typeof colorMap }>`
- Inline prop types — no separate interface files for component props
- Export named interface only when the type is shared across files (e.g., `export interface ProviderCardData`)

**JSON-LD structured data:**
- Define as a function returning a `<script>` tag: `function WebsiteJsonLd() { ... }`
- Use `dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}`
- Required on every public page

## Styling

**Tailwind CSS 4:**
- Import in `src/app/globals.css`: `@import "tailwindcss"` (NOT `@tailwind` directives)
- Custom theme tokens defined in `@theme` blocks in `globals.css`:
  - Colors: `--color-primary-{50-950}`, `--color-accent-{50-950}`, `--color-star`, `--color-star-empty`
  - Shadows: `--shadow-card`, `--shadow-card-hover`, `--shadow-header`
  - Radii: `--radius-card`, `--radius-button`, `--radius-badge`, `--radius-input`
- Font variables: `--font-sans` (Geist Sans), `--font-mono` (Geist Mono) loaded via `next/font/google`
- No CSS modules, no styled-components, no component libraries

**Tailwind usage pattern:**
- Utility classes applied directly in JSX `className`
- Template literals for conditional classes: `` `inline-flex ... ${variants[variant]} ${sizes[size]} ${className ?? ""}` ``
- Variant/size maps as `const` objects with `as const` assertions (see `Button.tsx`, `Badge.tsx`)
- Responsive modifiers: `sm:`, `lg:`, `xl:` prefixes used consistently
- Interactive states: `hover:`, `focus-visible:`, `disabled:` with transitions: `transition-colors`
- Semantic HTML elements: `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<header>`
- Accessibility: `aria-hidden="true"` on decorative SVGs, `aria-label` on icon-only buttons, `role="alert"` on error messages, `role="status"` on success messages

## Error Handling

**Server Actions:**
- Return `{ success: boolean, message: string, errors: Record<string, string> }` — never throw exceptions to the client
- Validate all inputs before database operations
- Use try/catch wrapping database calls
- `redirect()` in Next.js 16 throws a special error — always rethrow it:
  ```typescript
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    return { success: false, message: "...", errors: { general: "..." } };
  }
  ```
- Silent failure pattern for non-critical operations (click tracking, delete cleanups): `} catch { // Silently fail }`

**Pages:**
- Call `notFound()` from `next/navigation` when a resource is not found by slug
- `error.tsx` (client component) at route segment level with `reset` callback
- `not-found.tsx` with search bar and category suggestions
- `global-error.tsx` for unrecoverable errors (uses inline styles, not Tailwind, since CSS may not load)

**Validation pattern (Server Actions):**
```typescript
const errors: Record<string, string> = {};
if (!name) errors.name = "Name is required.";
if (!isValidCategory(category)) errors.category = "Valid category is required.";
if (Object.keys(errors).length > 0) {
  return { success: false, message: "Please fix the errors below.", errors };
}
```

**Input parsing helpers (defined in `src/app/actions/admin.ts`):**
- `getString(formData, key)` — trims string, returns `""`
- `getOptionalString(formData, key)` — returns `null` if empty
- `getOptionalInt(formData, key)` — parses int, returns `null` if empty/NaN
- `getBoolean(formData, key)` — handles `"on"` (checkbox) and `"true"`
- `getStringArray(formData, key)` — uses `formData.getAll()`, filters non-strings

## Logging

**No structured logging library installed.** Use `console.log` only in seed scripts (`prisma/seed.ts`). No logging in application code.

## Comments

**Prisma schema:** Section separator comments with em-dash style: `// ─── Section Name ────`

**Source code section dividers:** `// --- Section Name ---` style (two dashes each side):
```typescript
// --- Helpers ---

// --- Types ---

// --- Server Action ---
```

**Inline documentation:** JSDoc only in `src/lib/format.ts` for pure utility functions:
```typescript
/**
 * Format integer cents to a dollar string.
 * formatPrice(799) => "$7.99"
 */
export function formatPrice(cents: number | null): string { ... }
```

**Inline comments:** Brief, purposeful — explain "why" not "what":
```typescript
// Fire-and-forget: log the click without blocking the redirect
// redirect() throws a special error in Next.js -- rethrow it
// Silently fail -- click tracking should never block user navigation
```

## Function Design

**Query functions:** All wrapped in `React.cache()` for request-level deduplication:
```typescript
export const getProviderBySlug = cache(async (slug: string) => {
  return prisma.provider.findUnique({ ... });
});
```

**Server Actions signature:** Always accept `(_prevState: FormState, formData: FormData)` (the leading `_` on prevState when unused):
```typescript
export async function submitReview(
  _prevState: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> { ... }
```

**Void actions (delete/approve/reject):** Accept only `FormData`, return `Promise<void>`:
```typescript
export async function deleteProvider(formData: FormData): Promise<void> { ... }
```

**Helper functions:** Private (not exported), defined above the Server Action that uses them.

**Mutation side effects:** Call `revalidatePath()` after successful mutations. Multiple paths when content appears in multiple locations.

## Module Design

**Exports:**
- Pages/layouts: `export default function` (Next.js requirement)
- Named exports for everything else: `export const`, `export function`, `export interface`
- No barrel files in application code — import directly from source files
- Prisma-generated code uses barrel exports (do not edit)

**URL State:**
- URL search params are the source of truth for filter/sort state
- Parse with `await searchParams` (Promise in Next.js 16), then call a local `parseSearchParams()` helper
- Invalid values silently fall back to defaults (server is the authority on valid values)

---

*Convention analysis: 2026-03-21*
