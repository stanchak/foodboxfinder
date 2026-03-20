# Extended Schema Ideas (From Backend Architect Research)

## Valuable additions for post-MVP phases:

### High Priority
- **Redirect table** — `fromPath`, `toPath`, `statusCode` for SEO URL change management. Query in proxy.ts on every request. Critical when provider slugs change.
- **Category as separate model** (vs enum) — Allows SEO metadata per category (metaTitle, metaDescription, icon, heroImage). Currently hardcoded since we only have 5 categories, but a model would be more flexible for admin management.
- **ProAndCon as separate model** (vs JSON strings) — Sortable, editable individually. Current `prosJson`/`consJson` approach is simpler but less admin-friendly.
- **AffiliateLink model** (separate from AffiliateClick) — Store link config (URL, promo code, network, label) separately from click events. Enables promo code display on provider pages.

### Medium Priority
- **ProviderImage gallery** — Multiple images per provider for detail page gallery
- **DietaryOption as separate model** (vs enum) — SEO metadata per dietary option, admin-manageable
- **Tag model** — Freeform labels with grouping (audience, value, feature, cuisine) for secondary filtering
- **Review sub-ratings** — value, quality, variety, convenience, flexibility (5 dimensions for radar charts)
- **ComparisonSnapshot** — Save shareable comparison state in DB vs just URL params

### Lower Priority (post-launch)
- **AdminUser with roles** — Full auth system (EDITOR, ADMIN, SUPER_ADMIN). Currently using env var secret.
- **AuditLog** — Track admin actions (provider.create, review.approve, etc.)
- **USState delivery tracking** — State-level granularity vs current text description
- **BlogPost categories/tags via join tables** — vs current simpler flat structure
- **SiteSetting key-value** — vs env vars for site configuration

## Design decisions to revisit post-MVP:
1. Enum vs model for CategoryType — model when admin needs to manage categories
2. JSON strings vs model for pros/cons — model when admin needs per-item editing
3. Provider-level vs plan-level dietary options — plan-level for granular comparison
4. Flat review rating vs sub-dimensions — sub-dimensions for radar charts
