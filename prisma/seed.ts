import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import providers from "./seed-data/providers";
import { recalculateProviderPricing } from "./seed-data/helpers";
import { seedCollections } from "./seed-data/collections";
import { seedBlogPosts } from "./seed-data/blog-posts";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...\n");

  // Clean slate: delete all data in dependency order (children first)
  console.log("Clearing existing data...");
  await prisma.affiliateClick.deleteMany();
  await prisma.collectionItem.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.review.deleteMany();
  await prisma.providerFaq.deleteMany();
  await prisma.providerDietaryTag.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.provider.deleteMany();
  console.log("All existing data cleared.\n");

  // Create each provider with nested relations
  console.log("Creating providers...");
  for (const providerData of providers) {
    const provider = await prisma.provider.create({ data: providerData });
    console.log(`  Created: ${provider.name} (${provider.category})`);
  }
  console.log("");

  // Recalculate denormalized pricing fields
  console.log("Recalculating denormalized pricing...");
  const allProviders = await prisma.provider.findMany({ select: { id: true, name: true } });
  for (const { id, name } of allProviders) {
    await recalculateProviderPricing(prisma, id);
    console.log(`  Recalculated: ${name}`);
  }
  console.log("");

  // Seed collections (must run after providers exist)
  await seedCollections(prisma);
  console.log("");

  // Seed blog posts
  await seedBlogPosts(prisma);
  console.log("");

  // Print summary stats
  const providerCount = await prisma.provider.count();
  const planCount = await prisma.plan.count();
  const reviewCount = await prisma.review.count();
  const tagCount = await prisma.providerDietaryTag.count();
  const faqCount = await prisma.providerFaq.count();
  const collectionCount = await prisma.collection.count();
  const collectionItemCount = await prisma.collectionItem.count();
  const blogPostCount = await prisma.blogPost.count();

  const categoryCounts = await prisma.provider.groupBy({
    by: ["category"],
    _count: true,
  });

  console.log("=== Seed Summary ===");
  console.log(`Providers: ${providerCount}`);
  console.log(`Plans: ${planCount}`);
  console.log(`Reviews: ${reviewCount}`);
  console.log(`Dietary Tags: ${tagCount}`);
  console.log(`FAQs: ${faqCount}`);
  console.log(`Collections: ${collectionCount} (${collectionItemCount} items)`);
  console.log(`Blog Posts: ${blogPostCount}`);
  console.log("\nProviders per category:");
  for (const group of categoryCounts) {
    console.log(`  ${group.category}: ${group._count}`);
  }

  // Verify denormalized pricing
  const withPrices = await prisma.provider.count({
    where: { minPricePerServingCents: { not: null } },
  });
  console.log(`\nProviders with denormalized pricing: ${withPrices}`);
  console.log("\nSeed complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
