import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const collectionImages: Record<string, string> = {
  "best-meal-kits-families": "/assets/collections/best-meal-kits-families.png",
  "best-keto-meal-delivery": "/assets/collections/best-keto-meal-delivery.png",
  "most-affordable-food-boxes": "/assets/collections/most-affordable-food-boxes.png",
  "best-prepared-meals-professionals": "/assets/collections/best-prepared-meals-professionals.png",
  "best-organic-natural-food-boxes": "/assets/collections/best-organic-natural-food-boxes.png",
  "best-protein-meat-delivery": "/assets/collections/best-protein-meat-delivery.png",
};

const blogImages: Record<string, string> = {
  "meal-kit-vs-prepared-meals": "/assets/blog/meal-kit-vs-prepared-meals.png",
  "how-to-choose-food-box-2026": "/assets/blog/how-to-choose-food-box-2026.png",
  "tips-getting-most-from-meal-kit": "/assets/blog/tips-getting-most-from-meal-kit.png",
  "rise-of-specialty-diet-food-boxes": "/assets/blog/rise-of-specialty-diet-food-boxes.png",
  "food-box-subscriptions-beginners": "/assets/blog/food-box-subscriptions-beginners.png",
};

async function main() {
  console.log("Updating collection cover images...");
  for (const [slug, imageUrl] of Object.entries(collectionImages)) {
    const result = await prisma.collection.updateMany({
      where: { slug },
      data: { coverImageUrl: imageUrl },
    });
    console.log(`  ${slug}: ${result.count > 0 ? "updated" : "not found"}`);
  }

  console.log("\nUpdating blog post cover images...");
  for (const [slug, imageUrl] of Object.entries(blogImages)) {
    const result = await prisma.blogPost.updateMany({
      where: { slug },
      data: { coverImageUrl: imageUrl },
    });
    console.log(`  ${slug}: ${result.count > 0 ? "updated" : "not found"}`);
  }

  console.log("\nDone!");
  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
