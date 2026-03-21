import type { PrismaClient } from "../../src/generated/prisma/client";

interface CollectionDef {
  title: string;
  slug: string;
  description: string;
  body: string;
  metaTitle: string;
  metaDescription: string;
  publishedAt: Date;
  items: {
    providerSlug: string;
    sortOrder: number;
    note: string;
  }[];
}

const collections: CollectionDef[] = [
  {
    title: "Best Meal Kits for Families",
    slug: "best-meal-kits-families",
    description:
      "Finding a meal kit the whole family will love is no small feat. We tested the top family-friendly options for taste, ease of prep, and kid appeal to bring you this curated list.",
    body:
      "Weeknight dinners are the universal parenting struggle. Between picky eaters, tight schedules, and the eternal question of 'what's for dinner,' meal kits have become a lifeline for families across the country. But not every meal kit is built for a household with kids. We evaluated each service on portion flexibility, recipe complexity, kid-friendly menu options, and overall value per serving. The best family meal kits strike a balance between introducing new flavors and keeping things approachable enough that nobody stages a dinner table revolt. Every pick on this list offers at least a 4-serving option and includes recipes that can be on the table in 30 minutes or less.",
    metaTitle: "Best Meal Kits for Families in 2026 | Top 4 Picks",
    metaDescription:
      "Compare the best family meal kits of 2026. Kid-friendly recipes, flexible portions, and affordable per-serving pricing from $7.99.",
    publishedAt: new Date("2026-03-15"),
    items: [
      {
        providerSlug: "hellofresh",
        sortOrder: 0,
        note:
          "HelloFresh earns our top spot for families thanks to its dedicated Family plan starting at just $7.99 per serving. With 4-serving options and kid-tested recipes, it consistently delivers meals that even picky eaters will try.",
      },
      {
        providerSlug: "home-chef",
        sortOrder: 1,
        note:
          "Home Chef stands out for customization — you can swap proteins, upgrade ingredients, or choose oven-ready meals when you need an easier prep night. Their menu breadth means there is always something for everyone.",
      },
      {
        providerSlug: "everyplate",
        sortOrder: 2,
        note:
          "At just $5.99 per serving, EveryPlate is the most budget-friendly meal kit on this list. Recipes lean toward comfort food classics that kids tend to love, making it ideal for larger families watching their grocery spend.",
      },
      {
        providerSlug: "blue-apron",
        sortOrder: 3,
        note:
          "Blue Apron is the pick for families who want to level up their cooking. Their recipes are slightly more adventurous, making it a great choice for households with older kids or parents who enjoy the process as much as the meal.",
      },
    ],
  },
  {
    title: "Best Keto Meal Delivery",
    slug: "best-keto-meal-delivery",
    description:
      "Sticking to a keto diet is easier when someone else handles the macros. These meal delivery services offer genuinely low-carb options that taste great and keep you in ketosis.",
    body:
      "The ketogenic diet demands strict macro tracking — typically under 20-50 grams of net carbs per day — and that level of precision gets exhausting when you are cooking from scratch every meal. Keto meal delivery services solve this by handling the nutritional math for you, delivering meals that are high in healthy fats, moderate in protein, and reliably low in carbs. We evaluated each service on net carb accuracy, ingredient quality, flavor (because bland keto food helps nobody), and whether their menus offer enough variety to sustain a long-term subscription. Whether you prefer cooking with a meal kit or heating up a prepared meal, these are the best keto-friendly services we have tested.",
    metaTitle: "Best Keto Meal Delivery Services 2026 | Top 4",
    metaDescription:
      "Find the best keto meal delivery in 2026. Low-carb, high-fat meals with accurate macros from services like Factor, Green Chef, and more.",
    publishedAt: new Date("2026-03-14"),
    items: [
      {
        providerSlug: "factor",
        sortOrder: 0,
        note:
          "Factor is our top keto pick because every Keto meal comes fully prepared with macros clearly listed. No cooking, no guessing — just heat and eat with consistently under 20g net carbs per meal.",
      },
      {
        providerSlug: "green-chef",
        sortOrder: 1,
        note:
          "Green Chef offers a dedicated Keto + Paleo plan with USDA-certified organic ingredients. If you enjoy cooking but want the carb counting done for you, their pre-measured keto meal kits are hard to beat.",
      },
      {
        providerSlug: "trifecta-nutrition",
        sortOrder: 2,
        note:
          "Trifecta is built for performance-focused eaters. Their keto meals are macro-optimized with clean ingredients, organic produce, and no added sugar — ideal for athletes following a ketogenic protocol.",
      },
      {
        providerSlug: "sunbasket",
        sortOrder: 3,
        note:
          "Sunbasket rounds out the list with their Carb-Conscious plan featuring organic and sustainably sourced ingredients. Recipes are creative enough to prevent keto fatigue while staying reliably under 30g net carbs.",
      },
    ],
  },
  {
    title: "Most Affordable Food Boxes",
    slug: "most-affordable-food-boxes",
    description:
      "Eating well on a budget is absolutely possible with the right food box subscription. We compared per-serving costs, shipping fees, and overall value to find the most wallet-friendly options.",
    body:
      "The biggest criticism of food box subscriptions has always been the price tag. But the market has matured, and several services now compete aggressively on affordability without sacrificing meal quality. We looked beyond the advertised per-serving price to factor in shipping costs, minimum order requirements, and whether intro offers reflect the actual long-term cost. The services on this list genuinely deliver value — whether through rock-bottom per-serving pricing, rescued produce at a discount, or generous portion sizes that stretch further than their price suggests. If your primary concern is keeping the weekly food bill down while still eating varied, nutritious meals, these are the subscriptions worth your money.",
    metaTitle: "Most Affordable Food Box Subscriptions 2026",
    metaDescription:
      "Compare the cheapest food box subscriptions of 2026. Budget meal kits and produce boxes from $4.99/serving with free shipping options.",
    publishedAt: new Date("2026-03-13"),
    items: [
      {
        providerSlug: "everyplate",
        sortOrder: 0,
        note:
          "EveryPlate is the undisputed budget champion at $5.99 per serving. Their no-frills approach — simpler recipes, less packaging — keeps costs down without sacrificing flavor or portion size.",
      },
      {
        providerSlug: "farmbox-delivery",
        sortOrder: 1,
        note:
          "Farmbox Delivery delivers organic and natural produce boxes starting at competitive prices. Their smaller box options make it easy to supplement your grocery shopping without overcommitting.",
      },
      {
        providerSlug: "misfits-market",
        sortOrder: 2,
        note:
          "Misfits Market rescues cosmetically imperfect produce and overstock groceries, passing the savings on to you — typically 30-40% below grocery store prices. Excellent value for the quality-conscious budget shopper.",
      },
      {
        providerSlug: "hellofresh",
        sortOrder: 3,
        note:
          "HelloFresh may not be the cheapest per serving, but free shipping on most plans and the Family plan at $7.99/serving make it one of the best values among full-service meal kits.",
      },
    ],
  },
  {
    title: "Best Prepared Meals for Busy Professionals",
    slug: "best-prepared-meals-professionals",
    description:
      "When you barely have time to eat, let alone cook, prepared meal delivery services keep you fueled with nutritious food. These picks require zero cooking — just heat and enjoy.",
    body:
      "The prepared meal delivery category has exploded in quality over the past few years. What used to mean sad frozen dinners now means chef-crafted meals with restaurant-quality ingredients, delivered fresh to your door. For busy professionals, the appeal is straightforward: nutritious meals in under five minutes with no shopping, chopping, or cleanup. We evaluated these services on meal freshness, nutritional balance, menu variety, and the practical details that matter when you are eating at your desk — packaging convenience, reheating quality, and whether the food actually tastes good on round two. Every service on this list delivers fully prepared meals that require nothing more than a microwave or oven.",
    metaTitle: "Best Prepared Meal Delivery for Professionals 2026",
    metaDescription:
      "No-cook meal delivery for busy professionals. Chef-prepared, nutritious meals ready in minutes from Factor, CookUnity, and more.",
    publishedAt: new Date("2026-03-12"),
    items: [
      {
        providerSlug: "factor",
        sortOrder: 0,
        note:
          "Factor leads the prepared meal space with dietitian-designed meals, clear macro labels, and a rotating weekly menu of 35+ options. Meals reheat in two minutes and taste genuinely good — not just 'good for a microwave meal.'",
      },
      {
        providerSlug: "cookunity",
        sortOrder: 1,
        note:
          "CookUnity partners with independent chefs to offer restaurant-quality prepared meals you would never guess came from a delivery box. The variety is unmatched — think duck confit next to Thai curry next to plant-based bowls.",
      },
      {
        providerSlug: "snap-kitchen",
        sortOrder: 2,
        note:
          "Snap Kitchen focuses on balanced nutrition with clearly labeled macros on every meal. Their Whole30-approved and high-protein options are especially popular with health-focused professionals.",
      },
      {
        providerSlug: "mosaic-foods",
        sortOrder: 3,
        note:
          "Mosaic Foods offers plant-based prepared meals at a more accessible price point. Their smoothies and oat bowls add breakfast to the mix, rounding out a full day of no-cook nutrition.",
      },
    ],
  },
  {
    title: "Best Organic & Natural Food Boxes",
    slug: "best-organic-natural-food-boxes",
    description:
      "For shoppers who prioritize organic certification, sustainably sourced ingredients, and clean labels, these food box subscriptions set the highest standard for ingredient quality.",
    body:
      "Organic and natural food subscriptions serve a growing segment of consumers who want to know exactly where their food comes from and how it was produced. But 'organic' on a marketing page does not always mean USDA-certified organic in the box. We dug into certifications, sourcing transparency, and actual ingredient lists to separate the genuinely clean food boxes from the ones riding the wellness marketing wave. The services on this list have earned their place through verified organic certifications, partnerships with sustainable farms, and ingredient standards that go beyond the minimum. If clean eating is a core value rather than a passing interest, these are the subscriptions that will meet your standards.",
    metaTitle: "Best Organic Food Box Subscriptions 2026",
    metaDescription:
      "USDA-certified organic meal kits and produce boxes. Compare Sunbasket, Green Chef, Misfits Market, and Hungryroot for clean eating.",
    publishedAt: new Date("2026-03-11"),
    items: [
      {
        providerSlug: "sunbasket",
        sortOrder: 0,
        note:
          "Sunbasket earns the top spot with USDA organic certification, responsibly sourced seafood, and antibiotic-free meats. Their commitment to clean ingredients is reflected in every recipe card's sourcing notes.",
      },
      {
        providerSlug: "green-chef",
        sortOrder: 1,
        note:
          "Green Chef is the first USDA-certified organic meal kit company in the US. Every ingredient meets their organic standard, and their dedicated Keto, Paleo, and Plant-Based plans prove that organic eating is not one-size-fits-all.",
      },
      {
        providerSlug: "misfits-market",
        sortOrder: 2,
        note:
          "Misfits Market offers organic produce at a fraction of retail prices by rescuing imperfect but perfectly nutritious fruits and vegetables. A smart way to eat organic without the premium markup.",
      },
      {
        providerSlug: "hungryroot",
        sortOrder: 3,
        note:
          "Hungryroot combines a curated grocery delivery model with clean, simple ingredients. Their AI-powered recommendations learn your preferences over time, making healthy eating effortlessly personalized.",
      },
    ],
  },
  {
    title: "Best Protein & Meat Delivery",
    slug: "best-protein-meat-delivery",
    description:
      "For carnivores, fitness enthusiasts, and anyone who takes their protein seriously, these meat delivery subscriptions offer premium cuts, ethical sourcing, and unbeatable convenience.",
    body:
      "Grocery store meat aisles are a gamble — inconsistent quality, murky sourcing, and prices that fluctuate wildly. Protein and meat delivery services solve this by connecting you directly with farms and ranchers who raise animals according to strict standards: grass-fed, pasture-raised, hormone-free, and humanely handled. We evaluated these services on cut variety, sourcing transparency, packaging quality (because nobody wants thawed-out steaks), and whether the per-pound pricing actually represents good value compared to a quality butcher shop. Whether you are stocking a chest freezer or building weekly meals around premium protein, these three services deliver consistently excellent meat to your door.",
    metaTitle: "Best Meat Delivery Subscriptions 2026 | Top 3",
    metaDescription:
      "Compare the best meat delivery boxes of 2026. Grass-fed, pasture-raised protein from ButcherBox, Crowd Cow, and Good Chop.",
    publishedAt: new Date("2026-03-10"),
    items: [
      {
        providerSlug: "butcherbox",
        sortOrder: 0,
        note:
          "ButcherBox is the gold standard for meat delivery — 100% grass-fed beef, free-range organic chicken, heritage breed pork, and wild-caught seafood. Their curated and custom box options fit households of every size.",
      },
      {
        providerSlug: "crowd-cow",
        sortOrder: 1,
        note:
          "Crowd Cow connects you directly with independent farms and lets you choose exactly which cuts you want. Their transparency — you can see the farm, the breed, and the practices — is unmatched in the industry.",
      },
      {
        providerSlug: "good-chop",
        sortOrder: 2,
        note:
          "Good Chop sources exclusively from American farms with no antibiotics or added hormones. Their straightforward box model — choose your cuts from a set number of items — keeps pricing simple and predictable.",
      },
    ],
  },
];

export async function seedCollections(prisma: PrismaClient): Promise<void> {
  console.log("Creating collections...");

  for (const collectionDef of collections) {
    // Look up provider IDs for collection items
    const providerSlugs = collectionDef.items.map((item) => item.providerSlug);
    const providers = await prisma.provider.findMany({
      where: { slug: { in: providerSlugs } },
      select: { id: true, slug: true, name: true },
    });

    const slugToId = new Map(providers.map((p) => [p.slug, p.id]));

    // Warn about missing providers
    for (const item of collectionDef.items) {
      if (!slugToId.has(item.providerSlug)) {
        console.warn(
          `  Warning: Provider "${item.providerSlug}" not found for collection "${collectionDef.title}". Skipping item.`,
        );
      }
    }

    // Build collection items data, filtering out missing providers
    const itemsData = collectionDef.items
      .filter((item) => slugToId.has(item.providerSlug))
      .map((item) => ({
        providerId: slugToId.get(item.providerSlug)!,
        sortOrder: item.sortOrder,
        note: item.note,
      }));

    const collection = await prisma.collection.create({
      data: {
        title: collectionDef.title,
        slug: collectionDef.slug,
        description: collectionDef.description,
        body: collectionDef.body,
        status: "PUBLISHED",
        publishedAt: collectionDef.publishedAt,
        metaTitle: collectionDef.metaTitle,
        metaDescription: collectionDef.metaDescription,
        items: {
          create: itemsData,
        },
      },
    });

    console.log(
      `  Created: "${collection.title}" (${itemsData.length} providers)`,
    );
  }
}
