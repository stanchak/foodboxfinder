export const metadata = {
  title: "Theme Preview",
};

/* ---------- Theme definitions ---------- */

interface Theme {
  id: string;
  name: string;
  tagline: string;
  description: string;
  // Colors
  background: string;
  foreground: string;
  primary: string;
  primaryLight: string;
  accent: string;
  neutral100: string;
  neutral200: string;
  neutral500: string;
  neutral600: string;
  cardBorder: string;
  cardShadow: string;
  star: string;
  // Typography
  fontBody: string;
  fontHeading: string;
  headingWeight: number;
  headingTransform: string; // "none" | "uppercase"
  headingTracking: string; // letter-spacing
  bodySize: string;
  // Buttons
  btnRadius: string;
  btnPadding: string;
  btnWeight: number;
  btnTransform: string;
  btnTracking: string;
  btnShadow: string;
  btnBorderWidth: string;
  outlineBtnStyle: "border" | "ghost" | "underline";
  // Cards
  cardRadius: string;
  cardBorderWidth: string;
  cardHasTopAccent: boolean;
  cardImageRadius: string; // inner image radius
  cardPadding: string;
  cardBadgeRadius: string;
  // Layout
  pillRadius: string;
  sectionSpacing: string;
  // Extra personality
  hrStyle: string; // border style for dividers
  logoWeight: number;
  logoSize: string;
}

const themes: Theme[] = [
  {
    id: "clean-slate",
    name: "Clean Slate",
    tagline: "System font, pill buttons, soft shadows",
    description: "The safe default. System font stack, gentle blue, pill-shaped buttons, light card shadows. Works for everyone, offends no one.",
    background: "#ffffff",
    foreground: "#1e293b",
    primary: "#3b82f6",
    primaryLight: "#eff6ff",
    accent: "#10b981",
    neutral100: "#f1f5f9",
    neutral200: "#e2e8f0",
    neutral500: "#64748b",
    neutral600: "#475569",
    cardBorder: "#e2e8f0",
    cardShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
    star: "#f59e0b",
    fontBody: "system-ui, -apple-system, sans-serif",
    fontHeading: "system-ui, -apple-system, sans-serif",
    headingWeight: 700,
    headingTransform: "none",
    headingTracking: "normal",
    bodySize: "0.875rem",
    btnRadius: "9999px",
    btnPadding: "0.5rem 1.25rem",
    btnWeight: 600,
    btnTransform: "none",
    btnTracking: "normal",
    btnShadow: "0 1px 2px rgba(0,0,0,0.05)",
    btnBorderWidth: "1px",
    outlineBtnStyle: "border",
    cardRadius: "0.75rem",
    cardBorderWidth: "1px",
    cardHasTopAccent: false,
    cardImageRadius: "0",
    cardPadding: "1rem",
    cardBadgeRadius: "9999px",
    pillRadius: "9999px",
    sectionSpacing: "2rem",
    hrStyle: "solid",
    logoWeight: 700,
    logoSize: "1.1rem",
  },
  {
    id: "warm-editorial",
    name: "Warm Editorial",
    tagline: "Georgia serif, square buttons, no shadows",
    description: "Newspaper feel. Serif headings, sharp square corners, zero shadows, hairline borders. Content-first, no decoration.",
    background: "#fcfcfa",
    foreground: "#1a1a1a",
    primary: "#c53030",
    primaryLight: "#fef2f2",
    accent: "#2b6cb0",
    neutral100: "#f5f5f3",
    neutral200: "#e8e8e4",
    neutral500: "#737370",
    neutral600: "#525250",
    cardBorder: "#d5d5d0",
    cardShadow: "none",
    star: "#d69e2e",
    fontBody: "Georgia, 'Times New Roman', serif",
    fontHeading: "Georgia, 'Times New Roman', serif",
    headingWeight: 700,
    headingTransform: "none",
    headingTracking: "normal",
    bodySize: "0.9375rem",
    btnRadius: "0",
    btnPadding: "0.5rem 1.5rem",
    btnWeight: 700,
    btnTransform: "uppercase",
    btnTracking: "0.05em",
    btnShadow: "none",
    btnBorderWidth: "2px",
    outlineBtnStyle: "border",
    cardRadius: "0",
    cardBorderWidth: "1px",
    cardHasTopAccent: false,
    cardImageRadius: "0",
    cardPadding: "1rem",
    cardBadgeRadius: "0",
    pillRadius: "0",
    sectionSpacing: "2rem",
    hrStyle: "solid",
    logoWeight: 700,
    logoSize: "1.125rem",
  },
  {
    id: "nordic-mono",
    name: "Nordic Mono",
    tagline: "Monospace headings, muted palette, minimal UI",
    description: "Scandinavian tech aesthetic. Monospace headings, rounded-sm buttons, muted steel blue, understated everything.",
    background: "#f8f9fa",
    foreground: "#212529",
    primary: "#4a6fa5",
    primaryLight: "#edf2f8",
    accent: "#6c8c5c",
    neutral100: "#f1f3f5",
    neutral200: "#dee2e6",
    neutral500: "#868e96",
    neutral600: "#495057",
    cardBorder: "#dee2e6",
    cardShadow: "0 1px 2px rgba(0,0,0,0.04)",
    star: "#e8a838",
    fontBody: "system-ui, -apple-system, sans-serif",
    fontHeading: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
    headingWeight: 600,
    headingTransform: "none",
    headingTracking: "-0.02em",
    bodySize: "0.875rem",
    btnRadius: "0.25rem",
    btnPadding: "0.4375rem 1rem",
    btnWeight: 500,
    btnTransform: "none",
    btnTracking: "normal",
    btnShadow: "none",
    btnBorderWidth: "1px",
    outlineBtnStyle: "border",
    cardRadius: "0.375rem",
    cardBorderWidth: "1px",
    cardHasTopAccent: false,
    cardImageRadius: "0",
    cardPadding: "0.875rem",
    cardBadgeRadius: "0.25rem",
    pillRadius: "0.25rem",
    sectionSpacing: "1.75rem",
    hrStyle: "dashed",
    logoWeight: 600,
    logoSize: "1rem",
  },
  {
    id: "soft-pastel",
    name: "Soft Pastel",
    tagline: "Rounded-xl everything, light pink, gentle feel",
    description: "Extra rounded corners, soft pink primary, generous padding. Approachable and friendly without being juvenile.",
    background: "#fffbfa",
    foreground: "#27272a",
    primary: "#e11d48",
    primaryLight: "#fff1f2",
    accent: "#0891b2",
    neutral100: "#faf4f5",
    neutral200: "#f0e4e6",
    neutral500: "#71717a",
    neutral600: "#52525b",
    cardBorder: "#f0e4e6",
    cardShadow: "0 2px 8px rgba(225,29,72,0.06)",
    star: "#f59e0b",
    fontBody: "'DM Sans', system-ui, sans-serif",
    fontHeading: "'DM Sans', system-ui, sans-serif",
    headingWeight: 700,
    headingTransform: "none",
    headingTracking: "-0.01em",
    bodySize: "0.875rem",
    btnRadius: "0.75rem",
    btnPadding: "0.625rem 1.5rem",
    btnWeight: 600,
    btnTransform: "none",
    btnTracking: "normal",
    btnShadow: "0 2px 6px rgba(225,29,72,0.15)",
    btnBorderWidth: "0",
    outlineBtnStyle: "ghost",
    cardRadius: "1rem",
    cardBorderWidth: "0",
    cardHasTopAccent: false,
    cardImageRadius: "0.5rem",
    cardPadding: "1.25rem",
    cardBadgeRadius: "0.5rem",
    pillRadius: "0.75rem",
    sectionSpacing: "2.25rem",
    hrStyle: "solid",
    logoWeight: 700,
    logoSize: "1.1rem",
  },
  {
    id: "forest-ground",
    name: "Forest Ground",
    tagline: "Earthy green, cream bg, left-aligned card accent",
    description: "Warm cream base, deep forest green, left border accent on cards. Natural and grounded, good for food/organic brands.",
    background: "#fefdfb",
    foreground: "#1c1917",
    primary: "#15803d",
    primaryLight: "#f0fdf4",
    accent: "#b45309",
    neutral100: "#faf5f0",
    neutral200: "#f0e7db",
    neutral500: "#8a7968",
    neutral600: "#6b5c4c",
    cardBorder: "#e8ddd0",
    cardShadow: "0 1px 3px rgba(44,36,24,0.06)",
    star: "#d97706",
    fontBody: "'Source Sans 3', system-ui, sans-serif",
    fontHeading: "'Source Sans 3', system-ui, sans-serif",
    headingWeight: 700,
    headingTransform: "none",
    headingTracking: "normal",
    bodySize: "0.9375rem",
    btnRadius: "0.375rem",
    btnPadding: "0.5rem 1.25rem",
    btnWeight: 600,
    btnTransform: "none",
    btnTracking: "normal",
    btnShadow: "none",
    btnBorderWidth: "1px",
    outlineBtnStyle: "border",
    cardRadius: "0.5rem",
    cardBorderWidth: "1px",
    cardHasTopAccent: true,
    cardImageRadius: "0",
    cardPadding: "1rem",
    cardBadgeRadius: "0.25rem",
    pillRadius: "0.375rem",
    sectionSpacing: "2rem",
    hrStyle: "solid",
    logoWeight: 700,
    logoSize: "1.125rem",
  },
  {
    id: "midnight-sharp",
    name: "Midnight Sharp",
    tagline: "Indigo + Inter tight, small-radius, uppercase labels",
    description: "High contrast with tight Inter font, small radius, uppercase badge labels. Sharp, modern SaaS feel.",
    background: "#ffffff",
    foreground: "#111827",
    primary: "#4f46e5",
    primaryLight: "#eef2ff",
    accent: "#059669",
    neutral100: "#f3f4f6",
    neutral200: "#e5e7eb",
    neutral500: "#6b7280",
    neutral600: "#4b5563",
    cardBorder: "#e5e7eb",
    cardShadow: "0 1px 2px rgba(0,0,0,0.05)",
    star: "#f59e0b",
    fontBody: "'Inter Tight', 'Inter', system-ui, sans-serif",
    fontHeading: "'Inter Tight', 'Inter', system-ui, sans-serif",
    headingWeight: 800,
    headingTransform: "none",
    headingTracking: "-0.025em",
    bodySize: "0.8125rem",
    btnRadius: "0.375rem",
    btnPadding: "0.4375rem 1.125rem",
    btnWeight: 600,
    btnTransform: "none",
    btnTracking: "normal",
    btnShadow: "none",
    btnBorderWidth: "1px",
    outlineBtnStyle: "border",
    cardRadius: "0.5rem",
    cardBorderWidth: "1px",
    cardHasTopAccent: false,
    cardImageRadius: "0",
    cardPadding: "0.875rem",
    cardBadgeRadius: "0.25rem",
    pillRadius: "0.375rem",
    sectionSpacing: "1.75rem",
    hrStyle: "solid",
    logoWeight: 800,
    logoSize: "1rem",
  },
  {
    id: "golden-warmth",
    name: "Golden Warmth",
    tagline: "Amber-orange, DM Sans, rounded-lg cards with shadow",
    description: "Closest to current site. Warm amber primary, rounded-lg cards with warm shadows, DM Sans. Cozy food vibes.",
    background: "#fffcf8",
    foreground: "#292524",
    primary: "#d97706",
    primaryLight: "#fffbeb",
    accent: "#0d9488",
    neutral100: "#faf8f5",
    neutral200: "#f0ece5",
    neutral500: "#78716c",
    neutral600: "#57534e",
    cardBorder: "#e7e0d6",
    cardShadow: "0 1px 4px rgba(41,37,36,0.07), 0 1px 2px rgba(41,37,36,0.04)",
    star: "#d97706",
    fontBody: "'DM Sans', system-ui, sans-serif",
    fontHeading: "'DM Sans', system-ui, sans-serif",
    headingWeight: 700,
    headingTransform: "none",
    headingTracking: "-0.01em",
    bodySize: "0.875rem",
    btnRadius: "9999px",
    btnPadding: "0.5rem 1.5rem",
    btnWeight: 600,
    btnTransform: "none",
    btnTracking: "normal",
    btnShadow: "0 1px 3px rgba(217,119,6,0.2)",
    btnBorderWidth: "1px",
    outlineBtnStyle: "border",
    cardRadius: "0.75rem",
    cardBorderWidth: "1px",
    cardHasTopAccent: true,
    cardImageRadius: "0",
    cardPadding: "1.125rem",
    cardBadgeRadius: "9999px",
    pillRadius: "9999px",
    sectionSpacing: "2rem",
    hrStyle: "solid",
    logoWeight: 800,
    logoSize: "1.1rem",
  },
  {
    id: "ocean-teal",
    name: "Ocean Teal",
    tagline: "Teal primary, system font, borderless shadow cards",
    description: "No visible card borders — just subtle shadows. Teal primary, system font, pill buttons. Clean and modern.",
    background: "#f8fafc",
    foreground: "#0f172a",
    primary: "#0d9488",
    primaryLight: "#f0fdfa",
    accent: "#6366f1",
    neutral100: "#f1f5f9",
    neutral200: "#e2e8f0",
    neutral500: "#64748b",
    neutral600: "#475569",
    cardBorder: "transparent",
    cardShadow: "0 1px 3px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.05)",
    star: "#f59e0b",
    fontBody: "system-ui, -apple-system, sans-serif",
    fontHeading: "system-ui, -apple-system, sans-serif",
    headingWeight: 700,
    headingTransform: "none",
    headingTracking: "-0.01em",
    bodySize: "0.875rem",
    btnRadius: "9999px",
    btnPadding: "0.5rem 1.25rem",
    btnWeight: 600,
    btnTransform: "none",
    btnTracking: "normal",
    btnShadow: "0 1px 3px rgba(13,148,136,0.2)",
    btnBorderWidth: "0",
    outlineBtnStyle: "ghost",
    cardRadius: "0.75rem",
    cardBorderWidth: "0",
    cardHasTopAccent: false,
    cardImageRadius: "0",
    cardPadding: "1rem",
    cardBadgeRadius: "9999px",
    pillRadius: "9999px",
    sectionSpacing: "2rem",
    hrStyle: "solid",
    logoWeight: 700,
    logoSize: "1.1rem",
  },
  {
    id: "plum-modern",
    name: "Plum Modern",
    tagline: "Purple primary, medium-radius, underline outline buttons",
    description: "Purple primary with underline-style secondary buttons. Medium radius. Distinctive without being loud.",
    background: "#faf8ff",
    foreground: "#1e1b2e",
    primary: "#7c3aed",
    primaryLight: "#f5f3ff",
    accent: "#059669",
    neutral100: "#f4f2f7",
    neutral200: "#e5e2eb",
    neutral500: "#706b80",
    neutral600: "#524d63",
    cardBorder: "#e5e2eb",
    cardShadow: "0 1px 3px rgba(30,27,46,0.06)",
    star: "#f59e0b",
    fontBody: "'Inter', system-ui, sans-serif",
    fontHeading: "'Inter', system-ui, sans-serif",
    headingWeight: 700,
    headingTransform: "none",
    headingTracking: "-0.015em",
    bodySize: "0.875rem",
    btnRadius: "0.5rem",
    btnPadding: "0.5rem 1.25rem",
    btnWeight: 600,
    btnTransform: "none",
    btnTracking: "normal",
    btnShadow: "none",
    btnBorderWidth: "1px",
    outlineBtnStyle: "underline",
    cardRadius: "0.625rem",
    cardBorderWidth: "1px",
    cardHasTopAccent: false,
    cardImageRadius: "0",
    cardPadding: "1rem",
    cardBadgeRadius: "0.375rem",
    pillRadius: "0.5rem",
    sectionSpacing: "2rem",
    hrStyle: "solid",
    logoWeight: 700,
    logoSize: "1.1rem",
  },
  {
    id: "green-utility",
    name: "Green Utility",
    tagline: "Lime green, uppercase labels, utility-class density",
    description: "Utility-first aesthetic. Lime-green accents, uppercase small labels, tight spacing, no-frills borders. Functional and dense.",
    background: "#fafaf9",
    foreground: "#1c1917",
    primary: "#65a30d",
    primaryLight: "#f7fee7",
    accent: "#d97706",
    neutral100: "#f5f5f4",
    neutral200: "#e7e5e4",
    neutral500: "#78716c",
    neutral600: "#57534e",
    cardBorder: "#e7e5e4",
    cardShadow: "none",
    star: "#f59e0b",
    fontBody: "system-ui, -apple-system, sans-serif",
    fontHeading: "system-ui, -apple-system, sans-serif",
    headingWeight: 700,
    headingTransform: "uppercase",
    headingTracking: "0.04em",
    bodySize: "0.8125rem",
    btnRadius: "0.25rem",
    btnPadding: "0.375rem 1rem",
    btnWeight: 700,
    btnTransform: "uppercase",
    btnTracking: "0.06em",
    btnShadow: "none",
    btnBorderWidth: "2px",
    outlineBtnStyle: "border",
    cardRadius: "0.25rem",
    cardBorderWidth: "1px",
    cardHasTopAccent: false,
    cardImageRadius: "0",
    cardPadding: "0.75rem",
    cardBadgeRadius: "0.125rem",
    pillRadius: "0.25rem",
    sectionSpacing: "1.5rem",
    hrStyle: "solid",
    logoWeight: 800,
    logoSize: "0.9375rem",
  },
];

/* ---------- Helper components ---------- */

function StarIcon({ filled, color }: Readonly<{ filled: boolean; color: string }>) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? color : "none"} stroke={filled ? color : "#d1d5db"} strokeWidth="2" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function OutlineButton({ theme, children }: Readonly<{ theme: Theme; children: React.ReactNode }>) {
  if (theme.outlineBtnStyle === "underline") {
    return (
      <span style={{
        fontFamily: theme.fontBody,
        fontSize: "11px",
        fontWeight: theme.btnWeight,
        color: theme.primary,
        textTransform: theme.btnTransform as "uppercase" | "none",
        letterSpacing: theme.btnTracking,
        borderBottom: `2px solid ${theme.primary}`,
        padding: "0.375rem 0.25rem",
      }}>
        {children}
      </span>
    );
  }
  if (theme.outlineBtnStyle === "ghost") {
    return (
      <span style={{
        fontFamily: theme.fontBody,
        fontSize: "11px",
        fontWeight: theme.btnWeight,
        color: theme.primary,
        textTransform: theme.btnTransform as "uppercase" | "none",
        letterSpacing: theme.btnTracking,
        borderRadius: theme.btnRadius,
        padding: theme.btnPadding,
        backgroundColor: theme.primaryLight,
      }}>
        {children}
      </span>
    );
  }
  // default: border
  return (
    <span style={{
      fontFamily: theme.fontBody,
      fontSize: "11px",
      fontWeight: theme.btnWeight,
      color: theme.primary,
      textTransform: theme.btnTransform as "uppercase" | "none",
      letterSpacing: theme.btnTracking,
      border: `${theme.btnBorderWidth} solid ${theme.primary}`,
      borderRadius: theme.btnRadius,
      padding: theme.btnPadding,
    }}>
      {children}
    </span>
  );
}

/* ---------- Theme preview card ---------- */

function ThemeCard({ theme, index }: Readonly<{ theme: Theme; index: number }>) {
  return (
    <div className="rounded-xl border border-neutral-200 overflow-hidden bg-white">
      {/* Theme label */}
      <div className="px-5 py-3 border-b border-neutral-200 bg-neutral-50 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-neutral-400">#{index + 1}</span>
            <h3 className="text-base font-bold text-neutral-900">{theme.name}</h3>
          </div>
          <p className="text-xs text-primary-600 font-medium mt-0.5">{theme.tagline}</p>
          <p className="text-sm text-neutral-500 mt-1">{theme.description}</p>
        </div>
      </div>

      {/* Preview area */}
      <div style={{ backgroundColor: theme.background, color: theme.foreground, fontFamily: theme.fontBody, fontSize: theme.bodySize }} className="p-5">

        {/* Mini header */}
        <div className="flex items-center justify-between pb-3 mb-4" style={{ borderBottom: `1px ${theme.hrStyle} ${theme.neutral200}` }}>
          <span style={{ fontFamily: theme.fontHeading, fontWeight: theme.logoWeight, fontSize: theme.logoSize, color: theme.foreground, letterSpacing: theme.headingTracking }}>
            FoodBoxFinder
          </span>
          <div className="flex gap-3" style={{ color: theme.neutral500, fontSize: "0.75rem" }}>
            <span>Browse</span>
            <span>Compare</span>
            <span>Blog</span>
          </div>
        </div>

        {/* Mini hero */}
        <div className="text-center" style={{ marginBottom: theme.sectionSpacing }}>
          <h4 style={{
            fontFamily: theme.fontHeading,
            fontWeight: theme.headingWeight,
            fontSize: "1.25rem",
            color: theme.foreground,
            textTransform: theme.headingTransform as "uppercase" | "none",
            letterSpacing: theme.headingTracking,
          }}>
            Find Your Perfect Food Box
          </h4>
          <p className="mt-1.5" style={{ color: theme.neutral500, fontSize: "0.75rem" }}>
            Compare meal kits, prepared meals, and more
          </p>
          <div className="mt-3 flex justify-center items-center gap-3">
            {/* Primary button */}
            <span style={{
              display: "inline-block",
              fontFamily: theme.fontBody,
              fontSize: "11px",
              fontWeight: theme.btnWeight,
              color: "#ffffff",
              backgroundColor: theme.primary,
              borderRadius: theme.btnRadius,
              padding: theme.btnPadding,
              boxShadow: theme.btnShadow,
              textTransform: theme.btnTransform as "uppercase" | "none",
              letterSpacing: theme.btnTracking,
            }}>
              Search All
            </span>
            {/* Outline / ghost / underline button */}
            <OutlineButton theme={theme}>Compare</OutlineButton>
          </div>
        </div>

        {/* Mini cards row */}
        <div className="grid grid-cols-3 gap-3" style={{ marginBottom: theme.sectionSpacing }}>
          {["HelloFresh", "Factor", "Green Chef"].map((name) => (
            <div
              key={name}
              style={{
                border: theme.cardBorderWidth !== "0" ? `${theme.cardBorderWidth} solid ${theme.cardBorder}` : "none",
                borderRadius: theme.cardRadius,
                boxShadow: theme.cardShadow,
                backgroundColor: theme.background,
                overflow: "hidden",
                borderLeft: theme.cardHasTopAccent ? `3px solid ${theme.primary}` : undefined,
              }}
            >
              {/* Card image placeholder */}
              <div style={{
                height: "3.5rem",
                backgroundColor: theme.neutral100,
                borderRadius: theme.cardImageRadius !== "0" ? `${theme.cardImageRadius} ${theme.cardImageRadius} 0 0` : undefined,
              }} />
              <div style={{ padding: theme.cardPadding }}>
                <span style={{
                  display: "inline-block",
                  fontSize: "9px",
                  fontWeight: 600,
                  padding: "0.125rem 0.375rem",
                  marginBottom: "0.375rem",
                  backgroundColor: theme.primaryLight,
                  color: theme.primary,
                  borderRadius: theme.cardBadgeRadius,
                  textTransform: theme.headingTransform as "uppercase" | "none",
                  letterSpacing: theme.headingTransform === "uppercase" ? "0.04em" : "normal",
                }}>
                  Meal Kit
                </span>
                <p style={{ fontSize: "0.75rem", fontWeight: 700, color: theme.foreground, fontFamily: theme.fontHeading }}>{name}</p>
                <div className="flex gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <StarIcon key={i} filled={i <= 4} color={theme.star} />
                  ))}
                </div>
                <p style={{ fontSize: "0.75rem", fontWeight: 700, color: theme.primary, marginTop: "0.25rem" }}>
                  $9.99/serving
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Mini category pills */}
        <div className="flex gap-2 justify-center" style={{ marginBottom: theme.sectionSpacing }}>
          {["Meal Kits", "Prepared", "Protein", "Produce"].map((cat) => (
            <span key={cat} style={{
              fontSize: "10px",
              fontWeight: 500,
              padding: "0.25rem 0.625rem",
              backgroundColor: theme.neutral100,
              color: theme.neutral600,
              borderRadius: theme.pillRadius,
              border: `1px solid ${theme.neutral200}`,
              textTransform: theme.headingTransform as "uppercase" | "none",
              letterSpacing: theme.headingTransform === "uppercase" ? "0.04em" : "normal",
            }}>
              {cat}
            </span>
          ))}
        </div>

        {/* Mini CTA footer */}
        <div style={{ backgroundColor: theme.primaryLight, borderRadius: theme.cardRadius, padding: "0.75rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: theme.foreground, fontFamily: theme.fontHeading }}>
            Ready to find your box?
          </p>
          <span style={{
            display: "inline-block",
            marginTop: "0.375rem",
            fontSize: "10px",
            fontWeight: theme.btnWeight,
            color: "#ffffff",
            backgroundColor: theme.primary,
            borderRadius: theme.btnRadius,
            padding: "0.25rem 0.75rem",
            textTransform: theme.btnTransform as "uppercase" | "none",
            letterSpacing: theme.btnTracking,
          }}>
            Start Exploring
          </span>
        </div>
      </div>

      {/* Design specs bar */}
      <div className="px-5 py-3 border-t border-neutral-200 bg-neutral-50/50">
        <div className="flex items-center justify-between flex-wrap gap-y-1">
          <div className="flex items-center gap-2">
            {[theme.primary, theme.accent, theme.foreground, theme.neutral500, theme.background].map((color, i) => (
              <span key={i} className="inline-block w-4 h-4 rounded-full ring-1 ring-neutral-200" style={{ backgroundColor: color }} />
            ))}
          </div>
          <div className="flex items-center gap-3 text-[10px] text-neutral-400">
            <span>btn: <span className="font-mono text-neutral-600">{theme.btnRadius === "9999px" ? "pill" : theme.btnRadius === "0" ? "square" : theme.btnRadius}</span></span>
            <span>card: <span className="font-mono text-neutral-600">{theme.cardRadius === "0" ? "square" : theme.cardRadius}</span></span>
            <span>font: <span className="font-mono text-neutral-600">{theme.fontHeading.split(",")[0].replace(/'/g, "")}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */

export default function ThemePreviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900">Theme Preview</h1>
        <p className="mt-2 text-neutral-600">
          10 theme concepts. Each varies color, typography, button shape, card treatment, badge style, spacing, and border approach.
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        {themes.map((theme, i) => (
          <ThemeCard key={theme.id} theme={theme} index={i} />
        ))}
      </div>
    </div>
  );
}
