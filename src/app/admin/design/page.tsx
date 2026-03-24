"use client";

import { useState } from "react";

/* ========== LOGOS ========== */

const logos = [
  { file: "v10-01-red-bold-italic.jpg", label: "Red Bold Italic" },
  { file: "v10-02-red-bold-2line.jpg", label: "Red Two Lines" },
  { file: "v10-05-red-slab-serif.jpg", label: "Red Slab Serif" },
  { file: "v17-08-multi-larger-box.jpg", label: "Multicolor Large" },
];

/* ========== COLORS ========== */

const colors = [
  { id: "blue", label: "Blue", primary: "#3b82f6", primaryLight: "#eff6ff", star: "#f59e0b" },
  { id: "red", label: "Red", primary: "#dc2626", primaryLight: "#fef2f2", star: "#f59e0b" },
  { id: "teal", label: "Teal", primary: "#0d9488", primaryLight: "#f0fdfa", star: "#f59e0b" },
  { id: "orange", label: "Orange", primary: "#ea580c", primaryLight: "#fff7ed", star: "#ea580c" },
  { id: "green", label: "Green", primary: "#16a34a", primaryLight: "#f0fdf4", star: "#d97706" },
  { id: "indigo", label: "Indigo", primary: "#4f46e5", primaryLight: "#eef2ff", star: "#f59e0b" },
  { id: "purple", label: "Purple", primary: "#7c3aed", primaryLight: "#f5f3ff", star: "#f59e0b" },
  { id: "amber", label: "Amber", primary: "#d97706", primaryLight: "#fffbeb", star: "#d97706" },
  { id: "rose", label: "Rose", primary: "#e11d48", primaryLight: "#fff1f2", star: "#f59e0b" },
  { id: "slate", label: "Slate", primary: "#475569", primaryLight: "#f1f5f9", star: "#f59e0b" },
  { id: "emerald", label: "Emerald", primary: "#059669", primaryLight: "#ecfdf5", star: "#f59e0b" },
  { id: "navy", label: "Navy", primary: "#1e3a5f", primaryLight: "#e8eef5", star: "#e8a838" },
];

/* ========== THEMES (full rendering data) ========== */

interface Theme {
  id: string; name: string; tagline: string; defaultColor: string;
  background: string; foreground: string;
  neutral100: string; neutral200: string; neutral500: string; neutral600: string;
  cardBorder: string; cardShadow: string;
  fontBody: string; fontHeading: string; headingWeight: number; headingTransform: string; headingTracking: string;
  btnRadius: string; btnPadding: string; btnWeight: number; btnTransform: string; btnTracking: string;
  btnBorderWidth: string; outlineBtnStyle: "border" | "ghost" | "underline";
  cardRadius: string; cardBorderWidth: string; cardHasTopAccent: boolean; cardPadding: string; cardBadgeRadius: string;
  pillRadius: string; hrStyle: string;
}

const themes: Theme[] = [
  { id: "clean-slate", name: "Clean Slate", tagline: "System font, pill buttons, soft shadows", defaultColor: "blue",
    background: "#ffffff", foreground: "#1e293b", neutral100: "#f1f5f9", neutral200: "#e2e8f0", neutral500: "#64748b", neutral600: "#475569",
    cardBorder: "#e2e8f0", cardShadow: "0 1px 3px rgba(0,0,0,0.08)",
    fontBody: "system-ui, sans-serif", fontHeading: "system-ui, sans-serif", headingWeight: 700, headingTransform: "none", headingTracking: "normal",
    btnRadius: "9999px", btnPadding: "0.4rem 1rem", btnWeight: 600, btnTransform: "none", btnTracking: "normal",
    btnBorderWidth: "1px", outlineBtnStyle: "border",
    cardRadius: "0.75rem", cardBorderWidth: "1px", cardHasTopAccent: false, cardPadding: "0.75rem", cardBadgeRadius: "9999px",
    pillRadius: "9999px", hrStyle: "solid" },
  { id: "warm-editorial", name: "Warm Editorial", tagline: "Georgia serif, square everything", defaultColor: "red",
    background: "#fcfcfa", foreground: "#1a1a1a", neutral100: "#f5f5f3", neutral200: "#e8e8e4", neutral500: "#737370", neutral600: "#525250",
    cardBorder: "#d5d5d0", cardShadow: "none",
    fontBody: "Georgia, serif", fontHeading: "Georgia, serif", headingWeight: 700, headingTransform: "none", headingTracking: "normal",
    btnRadius: "0", btnPadding: "0.4rem 1rem", btnWeight: 700, btnTransform: "uppercase", btnTracking: "0.05em",
    btnBorderWidth: "2px", outlineBtnStyle: "border",
    cardRadius: "0", cardBorderWidth: "1px", cardHasTopAccent: false, cardPadding: "0.75rem", cardBadgeRadius: "0",
    pillRadius: "0", hrStyle: "solid" },
  { id: "nordic-mono", name: "Nordic Mono", tagline: "Monospace headings, dashed dividers", defaultColor: "navy",
    background: "#f8f9fa", foreground: "#212529", neutral100: "#f1f3f5", neutral200: "#dee2e6", neutral500: "#868e96", neutral600: "#495057",
    cardBorder: "#dee2e6", cardShadow: "0 1px 2px rgba(0,0,0,0.04)",
    fontBody: "system-ui, sans-serif", fontHeading: "'SF Mono', 'Fira Code', monospace", headingWeight: 600, headingTransform: "none", headingTracking: "-0.02em",
    btnRadius: "0.25rem", btnPadding: "0.35rem 0.75rem", btnWeight: 500, btnTransform: "none", btnTracking: "normal",
    btnBorderWidth: "1px", outlineBtnStyle: "border",
    cardRadius: "0.375rem", cardBorderWidth: "1px", cardHasTopAccent: false, cardPadding: "0.625rem", cardBadgeRadius: "0.25rem",
    pillRadius: "0.25rem", hrStyle: "dashed" },
  { id: "soft-pastel", name: "Soft Pastel", tagline: "Rounded-xl, ghost buttons, no borders", defaultColor: "rose",
    background: "#fffbfa", foreground: "#27272a", neutral100: "#faf4f5", neutral200: "#f0e4e6", neutral500: "#71717a", neutral600: "#52525b",
    cardBorder: "#f0e4e6", cardShadow: "0 2px 8px rgba(225,29,72,0.06)",
    fontBody: "'DM Sans', system-ui, sans-serif", fontHeading: "'DM Sans', system-ui, sans-serif", headingWeight: 700, headingTransform: "none", headingTracking: "-0.01em",
    btnRadius: "0.75rem", btnPadding: "0.45rem 1.1rem", btnWeight: 600, btnTransform: "none", btnTracking: "normal",
    btnBorderWidth: "0", outlineBtnStyle: "ghost",
    cardRadius: "1rem", cardBorderWidth: "0", cardHasTopAccent: false, cardPadding: "0.875rem", cardBadgeRadius: "0.5rem",
    pillRadius: "0.75rem", hrStyle: "solid" },
  { id: "forest-ground", name: "Forest Ground", tagline: "Cream bg, left card accent, earthy", defaultColor: "green",
    background: "#fefdfb", foreground: "#1c1917", neutral100: "#faf5f0", neutral200: "#f0e7db", neutral500: "#8a7968", neutral600: "#6b5c4c",
    cardBorder: "#e8ddd0", cardShadow: "0 1px 3px rgba(44,36,24,0.06)",
    fontBody: "'Source Sans 3', system-ui, sans-serif", fontHeading: "'Source Sans 3', system-ui, sans-serif", headingWeight: 700, headingTransform: "none", headingTracking: "normal",
    btnRadius: "0.375rem", btnPadding: "0.4rem 1rem", btnWeight: 600, btnTransform: "none", btnTracking: "normal",
    btnBorderWidth: "1px", outlineBtnStyle: "border",
    cardRadius: "0.5rem", cardBorderWidth: "1px", cardHasTopAccent: true, cardPadding: "0.75rem", cardBadgeRadius: "0.25rem",
    pillRadius: "0.375rem", hrStyle: "solid" },
  { id: "midnight-sharp", name: "Midnight Sharp", tagline: "Inter Tight, tight tracking, sharp", defaultColor: "indigo",
    background: "#ffffff", foreground: "#111827", neutral100: "#f3f4f6", neutral200: "#e5e7eb", neutral500: "#6b7280", neutral600: "#4b5563",
    cardBorder: "#e5e7eb", cardShadow: "0 1px 2px rgba(0,0,0,0.05)",
    fontBody: "'Inter Tight', system-ui, sans-serif", fontHeading: "'Inter Tight', system-ui, sans-serif", headingWeight: 800, headingTransform: "none", headingTracking: "-0.025em",
    btnRadius: "0.375rem", btnPadding: "0.35rem 0.85rem", btnWeight: 600, btnTransform: "none", btnTracking: "normal",
    btnBorderWidth: "1px", outlineBtnStyle: "border",
    cardRadius: "0.5rem", cardBorderWidth: "1px", cardHasTopAccent: false, cardPadding: "0.625rem", cardBadgeRadius: "0.25rem",
    pillRadius: "0.375rem", hrStyle: "solid" },
  { id: "golden-warmth", name: "Golden Warmth", tagline: "DM Sans, pill buttons, warm shadows", defaultColor: "amber",
    background: "#fffcf8", foreground: "#292524", neutral100: "#faf8f5", neutral200: "#f0ece5", neutral500: "#78716c", neutral600: "#57534e",
    cardBorder: "#e7e0d6", cardShadow: "0 1px 4px rgba(41,37,36,0.07)",
    fontBody: "'DM Sans', system-ui, sans-serif", fontHeading: "'DM Sans', system-ui, sans-serif", headingWeight: 700, headingTransform: "none", headingTracking: "-0.01em",
    btnRadius: "9999px", btnPadding: "0.4rem 1.1rem", btnWeight: 600, btnTransform: "none", btnTracking: "normal",
    btnBorderWidth: "1px", outlineBtnStyle: "border",
    cardRadius: "0.75rem", cardBorderWidth: "1px", cardHasTopAccent: true, cardPadding: "0.75rem", cardBadgeRadius: "9999px",
    pillRadius: "9999px", hrStyle: "solid" },
  { id: "ocean-teal", name: "Ocean Teal", tagline: "Borderless shadow cards, ghost buttons", defaultColor: "teal",
    background: "#f8fafc", foreground: "#0f172a", neutral100: "#f1f5f9", neutral200: "#e2e8f0", neutral500: "#64748b", neutral600: "#475569",
    cardBorder: "transparent", cardShadow: "0 1px 3px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.05)",
    fontBody: "system-ui, sans-serif", fontHeading: "system-ui, sans-serif", headingWeight: 700, headingTransform: "none", headingTracking: "-0.01em",
    btnRadius: "9999px", btnPadding: "0.4rem 1rem", btnWeight: 600, btnTransform: "none", btnTracking: "normal",
    btnBorderWidth: "0", outlineBtnStyle: "ghost",
    cardRadius: "0.75rem", cardBorderWidth: "0", cardHasTopAccent: false, cardPadding: "0.75rem", cardBadgeRadius: "9999px",
    pillRadius: "9999px", hrStyle: "solid" },
  { id: "plum-modern", name: "Plum Modern", tagline: "Inter, underline outline buttons", defaultColor: "purple",
    background: "#faf8ff", foreground: "#1e1b2e", neutral100: "#f4f2f7", neutral200: "#e5e2eb", neutral500: "#706b80", neutral600: "#524d63",
    cardBorder: "#e5e2eb", cardShadow: "0 1px 3px rgba(30,27,46,0.06)",
    fontBody: "'Inter', system-ui, sans-serif", fontHeading: "'Inter', system-ui, sans-serif", headingWeight: 700, headingTransform: "none", headingTracking: "-0.015em",
    btnRadius: "0.5rem", btnPadding: "0.4rem 1rem", btnWeight: 600, btnTransform: "none", btnTracking: "normal",
    btnBorderWidth: "1px", outlineBtnStyle: "underline",
    cardRadius: "0.625rem", cardBorderWidth: "1px", cardHasTopAccent: false, cardPadding: "0.75rem", cardBadgeRadius: "0.375rem",
    pillRadius: "0.5rem", hrStyle: "solid" },
  { id: "green-utility", name: "Green Utility", tagline: "Uppercase, dense, 2px borders", defaultColor: "green",
    background: "#fafaf9", foreground: "#1c1917", neutral100: "#f5f5f4", neutral200: "#e7e5e4", neutral500: "#78716c", neutral600: "#57534e",
    cardBorder: "#e7e5e4", cardShadow: "none",
    fontBody: "system-ui, sans-serif", fontHeading: "system-ui, sans-serif", headingWeight: 700, headingTransform: "uppercase", headingTracking: "0.04em",
    btnRadius: "0.25rem", btnPadding: "0.3rem 0.75rem", btnWeight: 700, btnTransform: "uppercase", btnTracking: "0.06em",
    btnBorderWidth: "2px", outlineBtnStyle: "border",
    cardRadius: "0.25rem", cardBorderWidth: "1px", cardHasTopAccent: false, cardPadding: "0.5rem", cardBadgeRadius: "0.125rem",
    pillRadius: "0.25rem", hrStyle: "solid" },
];

/* ========== MINI PREVIEW ========== */

function MiniPreview({ theme, primary, primaryLight, star, logoSrc }: {
  theme: Theme; primary: string; primaryLight: string; star: string; logoSrc: string;
}) {
  const tx = theme.headingTransform as "uppercase" | "none";
  const oStyle = theme.outlineBtnStyle;

  return (
    <div style={{ backgroundColor: theme.background, color: theme.foreground, fontFamily: theme.fontBody, fontSize: "0.7rem" }} className="p-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2" style={{ borderBottom: `1px ${theme.hrStyle} ${theme.neutral200}` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt="" className="h-6 w-auto object-contain" />
        <div className="flex gap-2" style={{ color: theme.neutral500, fontSize: "0.6rem" }}>
          <span>Discover</span><span>Best Of</span><span>Blog</span>
        </div>
      </div>
      {/* Hero */}
      <div className="text-center mb-2">
        <p style={{ fontFamily: theme.fontHeading, fontWeight: theme.headingWeight, fontSize: "0.85rem", textTransform: tx, letterSpacing: theme.headingTracking }}>
          Find Your Perfect <span style={{ color: primary }}>Food Box</span>
        </p>
        <p style={{ color: theme.neutral500, fontSize: "0.6rem" }} className="mt-0.5">Compare meal kits, prepared meals, and more</p>
        <div className="mt-1.5 flex justify-center items-center gap-1.5">
          <span style={{ fontSize: "9px", fontWeight: theme.btnWeight, color: "#fff", backgroundColor: primary, borderRadius: theme.btnRadius, padding: "0.2rem 0.6rem", textTransform: theme.btnTransform as "uppercase"|"none", letterSpacing: theme.btnTracking }}>Search All</span>
          {oStyle === "underline" ? (
            <span style={{ fontSize: "9px", fontWeight: theme.btnWeight, color: primary, borderBottom: `2px solid ${primary}`, padding: "0.2rem 0.15rem", textTransform: theme.btnTransform as "uppercase"|"none" }}>Compare</span>
          ) : oStyle === "ghost" ? (
            <span style={{ fontSize: "9px", fontWeight: theme.btnWeight, color: primary, backgroundColor: primaryLight, borderRadius: theme.btnRadius, padding: "0.2rem 0.6rem", textTransform: theme.btnTransform as "uppercase"|"none" }}>Compare</span>
          ) : (
            <span style={{ fontSize: "9px", fontWeight: theme.btnWeight, color: primary, border: `${theme.btnBorderWidth} solid ${primary}`, borderRadius: theme.btnRadius, padding: "0.2rem 0.6rem", textTransform: theme.btnTransform as "uppercase"|"none" }}>Compare</span>
          )}
        </div>
      </div>
      {/* Cards */}
      <div className="grid grid-cols-3 gap-1.5 mb-2">
        {["HelloFresh", "Factor", "Green Chef"].map((name) => (
          <div key={name} style={{ border: theme.cardBorderWidth !== "0" ? `${theme.cardBorderWidth} solid ${theme.cardBorder}` : "none", borderRadius: theme.cardRadius, boxShadow: theme.cardShadow, backgroundColor: theme.background, overflow: "hidden", borderLeft: theme.cardHasTopAccent ? `2px solid ${primary}` : undefined }}>
            <div style={{ height: "2rem", backgroundColor: theme.neutral100 }} />
            <div style={{ padding: theme.cardPadding }}>
              <span style={{ display: "inline-block", fontSize: "7px", fontWeight: 600, padding: "0.05rem 0.25rem", marginBottom: "0.2rem", backgroundColor: primaryLight, color: primary, borderRadius: theme.cardBadgeRadius }}>Meal Kit</span>
              <p style={{ fontSize: "0.6rem", fontWeight: 700, fontFamily: theme.fontHeading }}>{name}</p>
              <div className="flex gap-px mt-0.5">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} width="10" height="10" viewBox="0 0 24 24" fill={i <= 4 ? star : "none"} stroke={i <= 4 ? star : "#d1d5db"} strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p style={{ fontSize: "0.6rem", fontWeight: 700, color: primary, marginTop: "0.15rem" }}>$9.99/srv</p>
            </div>
          </div>
        ))}
      </div>
      {/* Pills */}
      <div className="flex gap-1 justify-center mb-2">
        {["Meal Kits", "Prepared", "Protein"].map(c => (
          <span key={c} style={{ fontSize: "8px", fontWeight: 500, padding: "0.15rem 0.4rem", backgroundColor: theme.neutral100, color: theme.neutral600, borderRadius: theme.pillRadius, border: `1px solid ${theme.neutral200}`, textTransform: tx }}>{c}</span>
        ))}
      </div>
      {/* CTA */}
      <div style={{ backgroundColor: primaryLight, borderRadius: theme.cardRadius, padding: "0.5rem", textAlign: "center" }}>
        <p style={{ fontSize: "0.6rem", fontWeight: 700, fontFamily: theme.fontHeading }}>Ready to find your box?</p>
        <span style={{ display: "inline-block", marginTop: "0.25rem", fontSize: "8px", fontWeight: theme.btnWeight, color: "#fff", backgroundColor: primary, borderRadius: theme.btnRadius, padding: "0.15rem 0.5rem", textTransform: theme.btnTransform as "uppercase"|"none" }}>Start Exploring</span>
      </div>
    </div>
  );
}

/* ========== PAGE ========== */

export default function DesignStudioPage() {
  const [selectedLogo, setSelectedLogo] = useState(logos[0].file);
  const [palettes, setPalettes] = useState<Record<string, string>>(() =>
    Object.fromEntries(themes.map(t => [t.id, t.defaultColor]))
  );

  function openPreview(themeId: string) {
    const color = palettes[themeId];
    const url = `/api/design-preview?theme=${themeId}&color=${color}&logo=${encodeURIComponent(selectedLogo)}`;
    window.open(url, `preview-${themeId}-${color}`, "width=1400,height=900");
  }

  const logoSrc = `/assets/logos/box-concepts/${selectedLogo}`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900">Design Studio</h1>
        <p className="mt-2 text-neutral-600">Pick a logo, swap colors, then pop out to see a full live site in a new window.</p>
      </div>

      {/* Logo picker */}
      <div>
        <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3">Logo</h2>
        <div className="flex gap-3">
          {logos.map((logo) => (
            <button
              key={logo.file}
              onClick={() => setSelectedLogo(logo.file)}
              className={`relative rounded-lg border overflow-hidden transition-all ${selectedLogo === logo.file ? "ring-3 ring-primary-500 border-primary-400" : "border-neutral-200 hover:ring-2 hover:ring-primary-300"}`}
              style={{ width: 150 }}
            >
              <div className="relative aspect-[3/2] bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/assets/logos/box-concepts/${logo.file}`} alt={logo.label} className="w-full h-full object-contain p-1" />
              </div>
              <div className="px-2 py-1 bg-neutral-50 border-t border-neutral-100">
                <p className="text-[11px] font-bold text-neutral-800 truncate">{logo.label}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Theme grid */}
      <div>
        <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3">Themes</h2>
        <div className="grid gap-5 xl:grid-cols-2">
          {themes.map((theme) => {
            const activeColorId = palettes[theme.id];
            const c = colors.find(p => p.id === activeColorId) ?? colors[0];
            return (
              <div key={theme.id} className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all">
                {/* Header bar */}
                <div className="px-4 py-2.5 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-neutral-900">{theme.name}</span>
                    <span className="ml-2 text-xs text-neutral-400">{theme.tagline}</span>
                  </div>
                  <button
                    onClick={() => openPreview(theme.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Pop Out
                  </button>
                </div>

                {/* Mini preview */}
                <div className="cursor-pointer" onClick={() => openPreview(theme.id)}>
                  <MiniPreview theme={theme} primary={c.primary} primaryLight={c.primaryLight} star={c.star} logoSrc={logoSrc} />
                </div>

                {/* Color picker */}
                <div className="px-4 py-2 border-t border-neutral-100 bg-neutral-50/50 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-neutral-400 mr-0.5">Color:</span>
                  {colors.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPalettes(prev => ({ ...prev, [theme.id]: p.id }))}
                      className={`w-4.5 h-4.5 rounded-full transition-all ${activeColorId === p.id ? "ring-2 ring-offset-1 ring-neutral-900 scale-110" : "hover:scale-110 opacity-50 hover:opacity-100"}`}
                      style={{ backgroundColor: p.primary, width: 18, height: 18 }}
                      title={p.label}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
