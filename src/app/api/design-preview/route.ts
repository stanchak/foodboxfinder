import { NextRequest, NextResponse } from "next/server";

/* ========== DATA ========== */

const colorMap: Record<string, { primary: string; primaryLight: string; star: string }> = {
  blue: { primary: "#3b82f6", primaryLight: "#eff6ff", star: "#f59e0b" },
  red: { primary: "#dc2626", primaryLight: "#fef2f2", star: "#f59e0b" },
  teal: { primary: "#0d9488", primaryLight: "#f0fdfa", star: "#f59e0b" },
  orange: { primary: "#ea580c", primaryLight: "#fff7ed", star: "#ea580c" },
  green: { primary: "#16a34a", primaryLight: "#f0fdf4", star: "#d97706" },
  indigo: { primary: "#4f46e5", primaryLight: "#eef2ff", star: "#f59e0b" },
  purple: { primary: "#7c3aed", primaryLight: "#f5f3ff", star: "#f59e0b" },
  amber: { primary: "#d97706", primaryLight: "#fffbeb", star: "#d97706" },
  rose: { primary: "#e11d48", primaryLight: "#fff1f2", star: "#f59e0b" },
  slate: { primary: "#475569", primaryLight: "#f1f5f9", star: "#f59e0b" },
  emerald: { primary: "#059669", primaryLight: "#ecfdf5", star: "#f59e0b" },
  navy: { primary: "#1e3a5f", primaryLight: "#e8eef5", star: "#e8a838" },
};

interface T {
  bg: string; fg: string; n1: string; n2: string; n5: string; n6: string;
  cb: string; cs: string;
  fb: string; fh: string; hw: number; ht: string; hk: string;
  br: string; bp: string; bw: number; bt: string; bk: string; bbw: string;
  obs: "border" | "ghost" | "underline";
  cr: string; cbw: string; cta: boolean; cp: string; cbr: string;
  pr: string; hr: string;
}

const themeMap: Record<string, T> = {
  "clean-slate": { bg:"#ffffff",fg:"#1e293b",n1:"#f1f5f9",n2:"#e2e8f0",n5:"#64748b",n6:"#475569",cb:"#e2e8f0",cs:"0 1px 3px rgba(0,0,0,0.08)",fb:"system-ui, sans-serif",fh:"system-ui, sans-serif",hw:700,ht:"none",hk:"normal",br:"9999px",bp:"0.625rem 1.5rem",bw:600,bt:"none",bk:"normal",bbw:"1px",obs:"border",cr:"0.75rem",cbw:"1px",cta:false,cp:"1.25rem",cbr:"9999px",pr:"9999px",hr:"solid" },
  "warm-editorial": { bg:"#fcfcfa",fg:"#1a1a1a",n1:"#f5f5f3",n2:"#e8e8e4",n5:"#737370",n6:"#525250",cb:"#d5d5d0",cs:"none",fb:"Georgia, serif",fh:"Georgia, serif",hw:700,ht:"none",hk:"normal",br:"0",bp:"0.625rem 1.5rem",bw:700,bt:"uppercase",bk:"0.05em",bbw:"2px",obs:"border",cr:"0",cbw:"1px",cta:false,cp:"1.25rem",cbr:"0",pr:"0",hr:"solid" },
  "nordic-mono": { bg:"#f8f9fa",fg:"#212529",n1:"#f1f3f5",n2:"#dee2e6",n5:"#868e96",n6:"#495057",cb:"#dee2e6",cs:"0 1px 2px rgba(0,0,0,0.04)",fb:"system-ui, sans-serif",fh:"'SF Mono','Fira Code',monospace",hw:600,ht:"none",hk:"-0.02em",br:"0.25rem",bp:"0.5rem 1.25rem",bw:500,bt:"none",bk:"normal",bbw:"1px",obs:"border",cr:"0.375rem",cbw:"1px",cta:false,cp:"1rem",cbr:"0.25rem",pr:"0.25rem",hr:"dashed" },
  "soft-pastel": { bg:"#fffbfa",fg:"#27272a",n1:"#faf4f5",n2:"#f0e4e6",n5:"#71717a",n6:"#52525b",cb:"#f0e4e6",cs:"0 2px 8px rgba(225,29,72,0.06)",fb:"'DM Sans',system-ui,sans-serif",fh:"'DM Sans',system-ui,sans-serif",hw:700,ht:"none",hk:"-0.01em",br:"0.75rem",bp:"0.625rem 1.5rem",bw:600,bt:"none",bk:"normal",bbw:"0",obs:"ghost",cr:"1rem",cbw:"0",cta:false,cp:"1.5rem",cbr:"0.5rem",pr:"0.75rem",hr:"solid" },
  "forest-ground": { bg:"#fefdfb",fg:"#1c1917",n1:"#faf5f0",n2:"#f0e7db",n5:"#8a7968",n6:"#6b5c4c",cb:"#e8ddd0",cs:"0 1px 3px rgba(44,36,24,0.06)",fb:"'Source Sans 3',system-ui,sans-serif",fh:"'Source Sans 3',system-ui,sans-serif",hw:700,ht:"none",hk:"normal",br:"0.375rem",bp:"0.625rem 1.5rem",bw:600,bt:"none",bk:"normal",bbw:"1px",obs:"border",cr:"0.5rem",cbw:"1px",cta:true,cp:"1.25rem",cbr:"0.25rem",pr:"0.375rem",hr:"solid" },
  "midnight-sharp": { bg:"#ffffff",fg:"#111827",n1:"#f3f4f6",n2:"#e5e7eb",n5:"#6b7280",n6:"#4b5563",cb:"#e5e7eb",cs:"0 1px 2px rgba(0,0,0,0.05)",fb:"'Inter Tight',system-ui,sans-serif",fh:"'Inter Tight',system-ui,sans-serif",hw:800,ht:"none",hk:"-0.025em",br:"0.375rem",bp:"0.5rem 1.25rem",bw:600,bt:"none",bk:"normal",bbw:"1px",obs:"border",cr:"0.5rem",cbw:"1px",cta:false,cp:"1rem",cbr:"0.25rem",pr:"0.375rem",hr:"solid" },
  "golden-warmth": { bg:"#fffcf8",fg:"#292524",n1:"#faf8f5",n2:"#f0ece5",n5:"#78716c",n6:"#57534e",cb:"#e7e0d6",cs:"0 1px 4px rgba(41,37,36,0.07)",fb:"'DM Sans',system-ui,sans-serif",fh:"'DM Sans',system-ui,sans-serif",hw:700,ht:"none",hk:"-0.01em",br:"9999px",bp:"0.625rem 1.5rem",bw:600,bt:"none",bk:"normal",bbw:"1px",obs:"border",cr:"0.75rem",cbw:"1px",cta:true,cp:"1.25rem",cbr:"9999px",pr:"9999px",hr:"solid" },
  "ocean-teal": { bg:"#f8fafc",fg:"#0f172a",n1:"#f1f5f9",n2:"#e2e8f0",n5:"#64748b",n6:"#475569",cb:"transparent",cs:"0 1px 3px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.05)",fb:"system-ui, sans-serif",fh:"system-ui, sans-serif",hw:700,ht:"none",hk:"-0.01em",br:"9999px",bp:"0.625rem 1.5rem",bw:600,bt:"none",bk:"normal",bbw:"0",obs:"ghost",cr:"0.75rem",cbw:"0",cta:false,cp:"1.25rem",cbr:"9999px",pr:"9999px",hr:"solid" },
  "plum-modern": { bg:"#faf8ff",fg:"#1e1b2e",n1:"#f4f2f7",n2:"#e5e2eb",n5:"#706b80",n6:"#524d63",cb:"#e5e2eb",cs:"0 1px 3px rgba(30,27,46,0.06)",fb:"'Inter',system-ui,sans-serif",fh:"'Inter',system-ui,sans-serif",hw:700,ht:"none",hk:"-0.015em",br:"0.5rem",bp:"0.625rem 1.5rem",bw:600,bt:"none",bk:"normal",bbw:"1px",obs:"underline",cr:"0.625rem",cbw:"1px",cta:false,cp:"1.25rem",cbr:"0.375rem",pr:"0.5rem",hr:"solid" },
  "green-utility": { bg:"#fafaf9",fg:"#1c1917",n1:"#f5f5f4",n2:"#e7e5e4",n5:"#78716c",n6:"#57534e",cb:"#e7e5e4",cs:"none",fb:"system-ui, sans-serif",fh:"system-ui, sans-serif",hw:700,ht:"uppercase",hk:"0.04em",br:"0.25rem",bp:"0.5rem 1.25rem",bw:700,bt:"uppercase",bk:"0.06em",bbw:"2px",obs:"border",cr:"0.25rem",cbw:"1px",cta:false,cp:"1rem",cbr:"0.125rem",pr:"0.25rem",hr:"solid" },
};

const providers = [
  { name:"HelloFresh", cat:"Meal Kit", desc:"America's most popular meal kit with chef-crafted recipes and pre-portioned ingredients.", rating:4.5, reviews:5, price:"$7.99" },
  { name:"Factor", cat:"Prepared Meal", desc:"Chef-prepared, dietitian-designed meals with keto, paleo, and vegan options.", rating:4.3, reviews:5, price:"$11.49" },
  { name:"Green Chef", cat:"Specialty", desc:"USDA-certified organic meal kit with keto, Mediterranean, and plant-based plans.", rating:4.5, reviews:5, price:"$11.99" },
  { name:"CookUnity", cat:"Prepared Meal", desc:"Chef marketplace with 100+ weekly dishes from independent chefs.", rating:4.4, reviews:4, price:"$9.99" },
  { name:"ButcherBox", cat:"Protein Box", desc:"Premium grass-fed beef, free-range chicken, and wild-caught seafood.", rating:4.3, reviews:5, price:"$6.50" },
  { name:"Misfits Market", cat:"Produce Box", desc:"Up to 40% off rescued organic produce and groceries.", rating:4.4, reviews:5, price:"$3.50" },
  { name:"Home Chef", cat:"Meal Kit", desc:"Flexible meal kit with 30+ weekly options including oven-ready meals.", rating:4.1, reviews:4, price:"$8.99" },
  { name:"Sunbasket", cat:"Specialty", desc:"Organic meal kits and fresh prepared meals for paleo and gluten-free diets.", rating:4.3, reviews:3, price:"$10.99" },
];

function stars(rating: number, color: string) {
  return [1,2,3,4,5].map(i =>
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="${i <= Math.floor(rating) ? color : 'none'}" stroke="${i <= Math.floor(rating) ? color : '#d1d5db'}" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
  ).join("");
}

function outlineBtn(t: T, primary: string, primaryLight: string, text: string) {
  if (t.obs === "underline") return `<span style="font-size:0.95rem;font-weight:${t.bw};color:${primary};text-transform:${t.bt};letter-spacing:${t.bk};border-bottom:2px solid ${primary};padding:0.5rem 0.25rem">${text}</span>`;
  if (t.obs === "ghost") return `<span style="font-size:0.95rem;font-weight:${t.bw};color:${primary};text-transform:${t.bt};letter-spacing:${t.bk};background:${primaryLight};border-radius:${t.br};padding:${t.bp}">${text}</span>`;
  return `<span style="font-size:0.95rem;font-weight:${t.bw};color:${primary};text-transform:${t.bt};letter-spacing:${t.bk};border:${t.bbw} solid ${primary};border-radius:${t.br};padding:${t.bp}">${text}</span>`;
}

/* ========== HANDLER ========== */

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const themeId = sp.get("theme") ?? "clean-slate";
  const colorId = sp.get("color") ?? "blue";
  const logo = sp.get("logo") ?? "v10-01-red-bold-italic.jpg";

  const t = themeMap[themeId] ?? themeMap["clean-slate"];
  const c = colorMap[colorId] ?? colorMap["blue"];
  const { primary, primaryLight, star } = c;
  const logoSrc = `/assets/logos/box-concepts/${logo}`;
  const tx = t.ht;

  const cards = providers.map(p => `
    <div style="border:${t.cbw !== "0" ? `${t.cbw} solid ${t.cb}` : "none"};border-radius:${t.cr};box-shadow:${t.cs};background:${t.bg};overflow:hidden;${t.cta ? `border-left:3px solid ${primary}` : ""}">
      <div style="height:8rem;background:${t.n1};display:flex;align-items:center;justify-content:center">
        <span style="font-size:2rem;font-weight:800;color:${t.n2}">${p.name[0]}</span>
      </div>
      <div style="padding:${t.cp}">
        <span style="display:inline-block;font-size:0.7rem;font-weight:600;padding:0.15rem 0.5rem;margin-bottom:0.5rem;background:${primaryLight};color:${primary};border-radius:${t.cbr}">${p.cat}</span>
        <p style="font-size:1rem;font-weight:700;font-family:${t.fh}">${p.name}</p>
        <p style="font-size:0.8rem;color:${t.n5};margin-top:0.35rem;line-height:1.4">${p.desc.slice(0, 85)}...</p>
        <div style="display:flex;gap:2px;margin-top:0.5rem;align-items:center">
          ${stars(p.rating, star)}
          <span style="font-size:0.75rem;color:${t.n5};margin-left:0.25rem">(${p.reviews})</span>
        </div>
        <p style="font-size:1.1rem;font-weight:700;color:${primary};margin-top:0.5rem">From ${p.price}/serving</p>
      </div>
    </div>
  `).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Design Preview — ${themeId} / ${colorId}</title>
  <style>*{margin:0;padding:0;box-sizing:border-box}</style>
</head>
<body style="font-family:${t.fb};color:${t.fg};background:${t.bg}">

  <!-- HEADER -->
  <header style="border-bottom:1px ${t.hr} ${t.n2};background:${t.bg}">
    <div style="max-width:1200px;margin:0 auto;padding:0 2rem;display:flex;align-items:center;justify-content:space-between;height:5rem">
      <img src="${logoSrc}" alt="FoodBoxFinder" style="height:3rem;width:auto;object-fit:contain"/>
      <nav style="display:flex;gap:2rem;color:${t.n5};font-size:0.95rem">
        <span style="color:${primary};font-weight:600">Discover</span>
        <span>Best Of</span>
        <span>Blog</span>
        <span>About</span>
      </nav>
    </div>
  </header>

  <!-- HERO -->
  <section style="padding:4rem 2rem;text-align:center;background:linear-gradient(135deg,${primaryLight},${t.bg})">
    <div style="max-width:700px;margin:0 auto">
      <h1 style="font-family:${t.fh};font-weight:${t.hw};font-size:2.75rem;letter-spacing:${t.hk};text-transform:${tx};line-height:1.15">
        Find Your Perfect <span style="color:${primary}">Food Box</span> Subscription
      </h1>
      <p style="margin-top:1.25rem;font-size:1.15rem;color:${t.n5};line-height:1.6">
        Compare meal kits, prepared meals, protein boxes, and more. Honest reviews, transparent pricing, and side-by-side comparisons.
      </p>
      <div style="margin-top:2rem;display:flex;gap:1rem;justify-content:center;align-items:center">
        <span style="font-size:0.95rem;font-weight:${t.bw};color:#fff;background:${primary};border-radius:${t.br};padding:${t.bp};text-transform:${t.bt};letter-spacing:${t.bk};cursor:pointer">Search All Providers</span>
        ${outlineBtn(t, primary, primaryLight, "Compare Side by Side")}
      </div>
    </div>
  </section>

  <!-- CATEGORY PILLS -->
  <div style="max-width:1200px;margin:0 auto;padding:2rem 2rem 0">
    <div style="display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap">
      ${["Meal Kits","Prepared Meals","Protein Boxes","Produce Boxes","Specialty"].map(c =>
        `<span style="font-size:0.85rem;font-weight:500;padding:0.4rem 1rem;background:${t.n1};color:${t.n6};border-radius:${t.pr};border:1px solid ${t.n2};text-transform:${tx};letter-spacing:${tx === "uppercase" ? "0.04em" : "normal"}">${c}</span>`
      ).join("")}
    </div>
  </div>

  <!-- FEATURED PROVIDERS -->
  <section style="max-width:1200px;margin:0 auto;padding:3rem 2rem">
    <div style="text-align:center;margin-bottom:2rem">
      <h2 style="font-family:${t.fh};font-weight:${t.hw};font-size:1.75rem;letter-spacing:${t.hk};text-transform:${tx}">Featured Providers</h2>
      <p style="color:${t.n5};margin-top:0.5rem">Top-rated food box subscriptions handpicked by our team</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1.5rem">
      ${cards}
    </div>
  </section>

  <!-- HOW IT WORKS -->
  <section style="background:${t.n1};padding:3rem 2rem">
    <div style="max-width:1200px;margin:0 auto;text-align:center">
      <h2 style="font-family:${t.fh};font-weight:${t.hw};font-size:1.75rem;letter-spacing:${t.hk};text-transform:${tx}">How It Works</h2>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2rem;margin-top:2rem">
        ${[
          { s:"1", title:"Browse", desc:"Explore our curated directory. Filter by category, dietary needs, and budget." },
          { s:"2", title:"Compare", desc:"Use side-by-side comparisons to evaluate pricing, meals, and flexibility." },
          { s:"3", title:"Subscribe", desc:"Choose the subscription that fits your lifestyle and sign up directly." },
        ].map(s => `
          <div>
            <div style="width:3rem;height:3rem;border-radius:0.75rem;background:${primaryLight};display:flex;align-items:center;justify-content:center;margin:0 auto">
              <span style="font-weight:800;color:${primary};font-size:1.25rem">${s.s}</span>
            </div>
            <p style="font-family:${t.fh};font-weight:${t.hw};font-size:1.1rem;margin-top:1rem;text-transform:${tx};letter-spacing:${t.hk}">${s.title}</p>
            <p style="color:${t.n5};font-size:0.875rem;margin-top:0.5rem;line-height:1.5">${s.desc}</p>
          </div>
        `).join("")}
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section style="padding:4rem 2rem;text-align:center">
    <div style="max-width:600px;margin:0 auto">
      <h2 style="font-family:${t.fh};font-weight:${t.hw};font-size:1.75rem;letter-spacing:${t.hk};text-transform:${tx}">Ready to find your perfect food box?</h2>
      <p style="color:${t.n5};margin-top:0.75rem;line-height:1.6">Whether you want chef-designed meal kits or farm-fresh produce delivered to your door, we help you compare the best options.</p>
      <div style="margin-top:1.5rem;display:flex;gap:1rem;justify-content:center;align-items:center">
        <span style="font-size:0.95rem;font-weight:${t.bw};color:#fff;background:${primary};border-radius:${t.br};padding:${t.bp};text-transform:${t.bt};letter-spacing:${t.bk}">Start Exploring</span>
        ${outlineBtn(t, primary, primaryLight, "Browse Collections")}
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer style="border-top:1px solid ${t.n2};padding:2rem;text-align:center;color:${t.n5};font-size:0.8rem">
    FoodBoxFinder — Design Preview (${themeId} + ${colorId})
  </footer>

</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
