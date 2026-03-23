/**
 * Phase 22 Plan 01: Status Cleanup & Parent Company Migration
 *
 * This script performs the following data updates:
 * 1. Batch update all UNCLEAR providers to ACTIVE
 * 2. Ensure Freshly is DISCONTINUED
 * 3. Set parentCompany values for 17 providers with known parent companies
 * 4. Update notes fields with M&A/ownership context for 13 providers
 *
 * Run with: npx tsx prisma/scripts/22-status-cleanup.ts
 */

import "dotenv/config";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Helper: append a note to a provider's existing notes field (or set if null)
async function appendNote(slug: string, newNote: string) {
  const provider = await prisma.provider.findUnique({
    where: { slug },
    select: { notes: true },
  });
  if (!provider) {
    console.log(`  SKIP: ${slug} not found in database`);
    return;
  }
  const updatedNotes = provider.notes
    ? `${provider.notes}\n\n${newNote}`
    : newNote;
  await prisma.provider.update({
    where: { slug },
    data: { notes: updatedNotes },
  });
  console.log(`  Updated notes for ${slug}`);
}

async function main() {
  console.log("=== Phase 22 Plan 01: Status Cleanup & Parent Company Migration ===\n");

  // 1. Batch update all UNCLEAR providers to ACTIVE
  console.log("1. Updating UNCLEAR providers to ACTIVE...");
  const unclearResult = await prisma.provider.updateMany({
    where: { status: "UNCLEAR" },
    data: { status: "ACTIVE" },
  });
  console.log(`   Updated ${unclearResult.count} providers from UNCLEAR to ACTIVE\n`);

  // 2. Ensure Freshly is DISCONTINUED
  console.log("2. Ensuring Freshly is DISCONTINUED...");
  await prisma.provider.update({
    where: { slug: "freshly" },
    data: { status: "DISCONTINUED" },
  });
  console.log("   Freshly status set to DISCONTINUED\n");

  // 3. Set parentCompany values for all providers with known parent companies
  console.log("3. Setting parentCompany values...");
  const parentCompanyMappings: Array<{ slug: string; parentCompany: string }> = [
    { slug: "hellofresh", parentCompany: "HelloFresh SE" },
    { slug: "factor", parentCompany: "HelloFresh SE" },
    { slug: "green-chef", parentCompany: "HelloFresh SE" },
    { slug: "everyplate", parentCompany: "HelloFresh SE" },
    { slug: "blue-apron", parentCompany: "Wonder Group" },
    { slug: "sunbasket", parentCompany: "Intelligent Foods" },
    { slug: "gobble", parentCompany: "Intelligent Foods" },
    { slug: "marley-spoon", parentCompany: "Marley Spoon Group SE" },
    { slug: "dinnerly", parentCompany: "Marley Spoon Group SE" },
    { slug: "bistromd", parentCompany: "Marley Spoon Group SE" },
    { slug: "misfits-market", parentCompany: "Misfits Market Inc" },
    { slug: "imperfect-foods", parentCompany: "Misfits Market Inc" },
    { slug: "home-chef", parentCompany: "Kroger" },
    { slug: "blue-bottle-coffee", parentCompany: "Nestle" },
    { slug: "harry-and-david", parentCompany: "1-800-Flowers.com Inc" },
    { slug: "cheryls", parentCompany: "1-800-Flowers.com Inc" },
    { slug: "misto", parentCompany: "Clive Coffee" },
  ];

  let parentCompanyCount = 0;
  for (const mapping of parentCompanyMappings) {
    try {
      await prisma.provider.update({
        where: { slug: mapping.slug },
        data: { parentCompany: mapping.parentCompany },
      });
      console.log(`   Set parentCompany for ${mapping.slug} -> ${mapping.parentCompany}`);
      parentCompanyCount++;
    } catch {
      console.log(`   SKIP: ${mapping.slug} not found in database`);
    }
  }
  console.log(`   Set parentCompany for ${parentCompanyCount} providers\n`);

  // 4. Update notes field with M&A/ownership context
  console.log("4. Updating notes with M&A/ownership context...");
  const notesUpdates: Array<{ slug: string; note: string }> = [
    {
      slug: "imperfect-foods",
      note: "Acquired by Misfits Market (Sep 2022). Brands operationally merged. Both websites still active.",
    },
    {
      slug: "blue-apron",
      note: "Acquired by Wonder Group (Nov 2023, $103M). Part of Wonder mealtime super app ecosystem.",
    },
    {
      slug: "marley-spoon",
      note: "US operations acquired by FreshRealm (Jan 2024, $24M). FreshRealm fulfills all US orders.",
    },
    {
      slug: "dinnerly",
      note: "Sister brand to Marley Spoon under Marley Spoon Group SE. US orders fulfilled by FreshRealm.",
    },
    {
      slug: "bistromd",
      note: "Acquired by Marley Spoon (Feb 2024). US orders fulfilled by FreshRealm.",
    },
    {
      slug: "gobble",
      note: "Owned by Intelligent Foods alongside Sunbasket. CEO Ooshma Garg leads both brands.",
    },
    {
      slug: "sunbasket",
      note: "Owned by Intelligent Foods alongside Gobble. CEO Ooshma Garg leads both brands.",
    },
    {
      slug: "veestro",
      note: "Pivoted from frozen to fresh meals (2024). Temporarily closed then reopened. Reduced delivery coverage.",
    },
    {
      slug: "moms-meals",
      note: "Settled $4.25M data breach lawsuit (PurFoods, 2025). Continues operating as nation's largest food-as-medicine provider.",
    },
    {
      slug: "munchpak",
      note: "Changed ownership March 2024. Operating under new management.",
    },
    {
      slug: "home-chef",
      note: "Owned by Kroger. 2,500+ store presence. Gordon Ramsay partnership 2025-2026.",
    },
    {
      slug: "misto",
      note: "Acquired by Clive Coffee (~2024). Personalized coffee subscription continues under Clive Coffee ownership.",
    },
    {
      slug: "freshly",
      note: "Discontinued by Nestle (Jan 2023). Operations ceased permanently.",
    },
  ];

  let notesCount = 0;
  for (const update of notesUpdates) {
    await appendNote(update.slug, update.note);
    notesCount++;
  }
  console.log(`   Updated notes for ${notesCount} providers\n`);

  // 5. Summary
  console.log("=== Migration Summary ===");
  console.log(`   Status updates (UNCLEAR -> ACTIVE): ${unclearResult.count}`);
  console.log(`   Freshly set to DISCONTINUED: 1`);
  console.log(`   parentCompany values set: ${parentCompanyCount}`);
  console.log(`   Notes updated: ${notesCount}`);
  console.log("\nDone!");

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("Migration failed:", e);
  await prisma.$disconnect();
  process.exit(1);
});
