"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import type { CategoryType, DietaryTag, PlanFrequency, ContentStatus, ProviderStatus } from "@/generated/prisma/client";

// -- Types --

export interface AdminFormState {
  success: boolean;
  message: string;
  errors: Record<string, string>;
}

const initialState: AdminFormState = {
  success: false,
  message: "",
  errors: {},
};

// -- Helpers --

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalString(formData: FormData, key: string): string | null {
  const value = getString(formData, key);
  return value.length > 0 ? value : null;
}

function getOptionalInt(formData: FormData, key: string): number | null {
  const value = getString(formData, key);
  if (value.length === 0) return null;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function getBoolean(formData: FormData, key: string): boolean {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function getStringArray(formData: FormData, key: string): string[] {
  return formData.getAll(key).filter((v): v is string => typeof v === "string");
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const VALID_CATEGORIES: CategoryType[] = [
  "MEAL_KIT",
  "PREPARED_MEAL",
  "PROTEIN_BOX",
  "PRODUCE_BOX",
  "SPECIALTY",
];

const VALID_DIETARY_TAGS: DietaryTag[] = [
  "VEGAN",
  "VEGETARIAN",
  "PESCATARIAN",
  "KETO",
  "PALEO",
  "GLUTEN_FREE",
  "DAIRY_FREE",
  "NUT_FREE",
  "LOW_CARB",
  "LOW_SODIUM",
  "ORGANIC",
  "HALAL",
  "KOSHER",
  "DIABETIC_FRIENDLY",
  "WHOLE30",
  "MEDITERRANEAN",
];

const VALID_CONTENT_STATUSES: ContentStatus[] = [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
];

const VALID_PROVIDER_STATUSES: ProviderStatus[] = [
  "ACTIVE",
  "HYBRID",
  "UNCLEAR",
  "DISCONTINUED",
];

const VALID_PLAN_FREQUENCIES: PlanFrequency[] = [
  "WEEKLY",
  "BIWEEKLY",
  "MONTHLY",
  "FLEXIBLE",
];

function isValidCategory(value: string): value is CategoryType {
  return VALID_CATEGORIES.includes(value as CategoryType);
}

function isValidDietaryTag(value: string): value is DietaryTag {
  return VALID_DIETARY_TAGS.includes(value as DietaryTag);
}

function isValidContentStatus(value: string): value is ContentStatus {
  return VALID_CONTENT_STATUSES.includes(value as ContentStatus);
}

function isValidProviderStatus(value: string): value is ProviderStatus {
  return VALID_PROVIDER_STATUSES.includes(value as ProviderStatus);
}

function isValidPlanFrequency(value: string): value is PlanFrequency {
  return VALID_PLAN_FREQUENCIES.includes(value as PlanFrequency);
}

// -- Auth --

export async function loginAction(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const secret = getString(formData, "secret");

  if (!secret) {
    return {
      ...initialState,
      message: "Please enter the admin secret.",
      errors: { secret: "Secret is required." },
    };
  }

  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret || secret !== adminSecret) {
    return {
      ...initialState,
      message: "Invalid admin secret.",
      errors: { secret: "The secret you entered is incorrect." },
    };
  }

  const cookieStore = await cookies();
  cookieStore.set("admin_token", secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
  redirect("/admin/login");
}

// -- Provider CRUD --

export async function createProvider(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const errors: Record<string, string> = {};

  const name = getString(formData, "name");
  const slug = getString(formData, "slug") || slugify(name);
  const description = getString(formData, "description");
  const shortDescription = getOptionalString(formData, "shortDescription");
  const website = getString(formData, "website");
  const affiliateUrl = getOptionalString(formData, "affiliateUrl");
  const logoUrl = getOptionalString(formData, "logoUrl");
  const heroImageUrl = getOptionalString(formData, "heroImageUrl");
  const foundedYear = getOptionalInt(formData, "foundedYear");
  const headquarters = getOptionalString(formData, "headquarters");
  const deliveryAreaDescription = getOptionalString(formData, "deliveryAreaDescription");
  const editorNote = getOptionalString(formData, "editorNote");
  const metaTitle = getOptionalString(formData, "metaTitle");
  const metaDescription = getOptionalString(formData, "metaDescription");
  const category = getString(formData, "category");
  const secondaryCategory = getOptionalString(formData, "secondaryCategory");
  const featured = getBoolean(formData, "featured");
  const status = getString(formData, "status") || "ACTIVE";
  const freeShipping = getBoolean(formData, "freeShipping");
  const dietaryTags = getStringArray(formData, "dietaryTags");

  // Pros and cons from textarea (one per line)
  const prosRaw = getString(formData, "pros");
  const consRaw = getString(formData, "cons");
  const pros = prosRaw.split("\n").map((s) => s.trim()).filter(Boolean);
  const cons = consRaw.split("\n").map((s) => s.trim()).filter(Boolean);

  // Validation
  if (!name) errors.name = "Name is required.";
  if (!slug) errors.slug = "Slug is required.";
  if (!description) errors.description = "Description is required.";
  if (!website) errors.website = "Website URL is required.";
  if (!category || !isValidCategory(category)) errors.category = "Valid category is required.";
  if (secondaryCategory && !isValidCategory(secondaryCategory)) {
    errors.secondaryCategory = "Invalid secondary category.";
  }
  if (!isValidProviderStatus(status)) errors.status = "Invalid status value.";

  for (const tag of dietaryTags) {
    if (!isValidDietaryTag(tag)) {
      errors.dietaryTags = `Invalid dietary tag: ${tag}`;
      break;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, message: "Please fix the errors below.", errors };
  }

  try {
    // Check for slug uniqueness
    const existing = await prisma.provider.findUnique({ where: { slug } });
    if (existing) {
      return {
        success: false,
        message: "A provider with this slug already exists.",
        errors: { slug: "This slug is already in use." },
      };
    }

    const provider = await prisma.provider.create({
      data: {
        name,
        slug,
        description,
        shortDescription,
        website,
        affiliateUrl,
        logoUrl,
        heroImageUrl,
        foundedYear,
        headquarters,
        deliveryAreaDescription,
        editorNote,
        metaTitle,
        metaDescription,
        category: category as CategoryType,
        secondaryCategory: secondaryCategory as CategoryType | null,
        featured,
        status: status as ProviderStatus,
        freeShipping,
        prosJson: pros.length > 0 ? pros : undefined,
        consJson: cons.length > 0 ? cons : undefined,
        dietaryTags: {
          create: dietaryTags.map((tag) => ({ tag: tag as DietaryTag })),
        },
      },
    });

    revalidatePath("/admin/providers");
    revalidatePath("/");
    redirect(`/admin/providers/${provider.id}/edit`);
  } catch (error) {
    // redirect() throws a special error in Next.js -- rethrow it
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    return {
      success: false,
      message: "Failed to create provider.",
      errors: { general: "An unexpected error occurred." },
    };
  }
}

export async function updateProvider(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const errors: Record<string, string> = {};

  const id = getString(formData, "id");
  const name = getString(formData, "name");
  const slug = getString(formData, "slug");
  const description = getString(formData, "description");
  const shortDescription = getOptionalString(formData, "shortDescription");
  const website = getString(formData, "website");
  const affiliateUrl = getOptionalString(formData, "affiliateUrl");
  const logoUrl = getOptionalString(formData, "logoUrl");
  const heroImageUrl = getOptionalString(formData, "heroImageUrl");
  const foundedYear = getOptionalInt(formData, "foundedYear");
  const headquarters = getOptionalString(formData, "headquarters");
  const deliveryAreaDescription = getOptionalString(formData, "deliveryAreaDescription");
  const editorNote = getOptionalString(formData, "editorNote");
  const metaTitle = getOptionalString(formData, "metaTitle");
  const metaDescription = getOptionalString(formData, "metaDescription");
  const category = getString(formData, "category");
  const secondaryCategory = getOptionalString(formData, "secondaryCategory");
  const featured = getBoolean(formData, "featured");
  const status = getString(formData, "status") || "ACTIVE";
  const freeShipping = getBoolean(formData, "freeShipping");
  const dietaryTags = getStringArray(formData, "dietaryTags");
  const minPricePerServingCents = getOptionalInt(formData, "minPricePerServingCents");
  const maxPricePerServingCents = getOptionalInt(formData, "maxPricePerServingCents");

  const prosRaw = getString(formData, "pros");
  const consRaw = getString(formData, "cons");
  const pros = prosRaw.split("\n").map((s) => s.trim()).filter(Boolean);
  const cons = consRaw.split("\n").map((s) => s.trim()).filter(Boolean);

  // Validation
  if (!id) errors.id = "Provider ID is required.";
  if (!name) errors.name = "Name is required.";
  if (!slug) errors.slug = "Slug is required.";
  if (!description) errors.description = "Description is required.";
  if (!website) errors.website = "Website URL is required.";
  if (!category || !isValidCategory(category)) errors.category = "Valid category is required.";
  if (secondaryCategory && !isValidCategory(secondaryCategory)) {
    errors.secondaryCategory = "Invalid secondary category.";
  }
  if (!isValidProviderStatus(status)) errors.status = "Invalid status value.";

  for (const tag of dietaryTags) {
    if (!isValidDietaryTag(tag)) {
      errors.dietaryTags = `Invalid dietary tag: ${tag}`;
      break;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, message: "Please fix the errors below.", errors };
  }

  try {
    // Check slug uniqueness (exclude self)
    const existing = await prisma.provider.findUnique({ where: { slug } });
    if (existing && existing.id !== id) {
      return {
        success: false,
        message: "A provider with this slug already exists.",
        errors: { slug: "This slug is already in use by another provider." },
      };
    }

    // Delete existing dietary tags and recreate
    await prisma.providerDietaryTag.deleteMany({ where: { providerId: id } });

    await prisma.provider.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        shortDescription,
        website,
        affiliateUrl,
        logoUrl,
        heroImageUrl,
        foundedYear,
        headquarters,
        deliveryAreaDescription,
        editorNote,
        metaTitle,
        metaDescription,
        category: category as CategoryType,
        secondaryCategory: secondaryCategory as CategoryType | null,
        featured,
        status: status as ProviderStatus,
        freeShipping,
        minPricePerServingCents,
        maxPricePerServingCents,
        prosJson: pros.length > 0 ? pros : Prisma.DbNull,
        consJson: cons.length > 0 ? cons : Prisma.DbNull,
        dietaryTags: {
          create: dietaryTags.map((tag) => ({ tag: tag as DietaryTag })),
        },
      },
    });

    revalidatePath("/admin/providers");
    revalidatePath(`/providers/${slug}`);
    revalidatePath("/");

    return {
      success: true,
      message: "Provider updated successfully.",
      errors: {},
    };
  } catch {
    return {
      success: false,
      message: "Failed to update provider.",
      errors: { general: "An unexpected error occurred." },
    };
  }
}

export async function deleteProvider(formData: FormData): Promise<void> {
  const id = getString(formData, "id");
  if (!id) return;

  try {
    await prisma.provider.delete({ where: { id } });
    revalidatePath("/admin/providers");
    revalidatePath("/");
  } catch {
    // Silently fail — the provider may already be deleted
  }

  redirect("/admin/providers");
}

// -- Plan CRUD --

export async function savePlan(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const errors: Record<string, string> = {};

  const id = getOptionalString(formData, "id");
  const providerId = getString(formData, "providerId");
  const name = getString(formData, "name");
  const description = getOptionalString(formData, "description");
  const pricePerServingCents = getOptionalInt(formData, "pricePerServingCents");
  const pricePerWeekCents = getOptionalInt(formData, "pricePerWeekCents");
  const pricePerBoxCents = getOptionalInt(formData, "pricePerBoxCents");
  const shippingCostCents = getOptionalInt(formData, "shippingCostCents") ?? 0;
  const shippingNote = getOptionalString(formData, "shippingNote");
  const introOfferNote = getOptionalString(formData, "introOfferNote");
  const servingsPerMeal = getOptionalInt(formData, "servingsPerMeal");
  const mealsPerWeek = getOptionalInt(formData, "mealsPerWeek");
  const frequency = getString(formData, "frequency") || "WEEKLY";
  const minimumOrder = getOptionalInt(formData, "minimumOrder");
  const canSkip = getBoolean(formData, "canSkip");
  const canCancel = getBoolean(formData, "canCancel");
  const cancelPolicy = getOptionalString(formData, "cancelPolicy");
  const featured = getBoolean(formData, "featured");
  const active = getBoolean(formData, "active");
  const sortOrder = getOptionalInt(formData, "sortOrder") ?? 0;

  if (!providerId) errors.providerId = "Provider ID is required.";
  if (!name) errors.name = "Plan name is required.";
  if (!isValidPlanFrequency(frequency)) errors.frequency = "Invalid frequency.";

  if (Object.keys(errors).length > 0) {
    return { success: false, message: "Please fix the errors below.", errors };
  }

  try {
    const data = {
      providerId,
      name,
      description,
      pricePerServingCents,
      pricePerWeekCents,
      pricePerBoxCents,
      shippingCostCents,
      shippingNote,
      introOfferNote,
      servingsPerMeal,
      mealsPerWeek,
      frequency: frequency as PlanFrequency,
      minimumOrder,
      canSkip,
      canCancel,
      cancelPolicy,
      featured,
      active,
      sortOrder,
    };

    if (id) {
      await prisma.plan.update({ where: { id }, data });
    } else {
      await prisma.plan.create({ data });
    }

    // Recalculate provider price denormalization
    const plans = await prisma.plan.findMany({
      where: { providerId, active: true },
      select: { pricePerServingCents: true, shippingCostCents: true },
    });

    const servingPrices = plans
      .map((p) => p.pricePerServingCents)
      .filter((v): v is number => v !== null);

    const hasFreeShipping = plans.some((p) => p.shippingCostCents === 0);

    await prisma.provider.update({
      where: { id: providerId },
      data: {
        minPricePerServingCents: servingPrices.length > 0 ? Math.min(...servingPrices) : null,
        maxPricePerServingCents: servingPrices.length > 0 ? Math.max(...servingPrices) : null,
        freeShipping: hasFreeShipping,
      },
    });

    revalidatePath(`/admin/providers/${providerId}/edit`);

    return {
      success: true,
      message: id ? "Plan updated successfully." : "Plan created successfully.",
      errors: {},
    };
  } catch {
    return {
      success: false,
      message: "Failed to save plan.",
      errors: { general: "An unexpected error occurred." },
    };
  }
}

export async function deletePlan(formData: FormData): Promise<void> {
  const id = getString(formData, "id");
  const providerId = getString(formData, "providerId");
  if (!id || !providerId) return;

  try {
    await prisma.plan.delete({ where: { id } });

    // Recalculate provider price denormalization
    const plans = await prisma.plan.findMany({
      where: { providerId, active: true },
      select: { pricePerServingCents: true, shippingCostCents: true },
    });

    const servingPrices = plans
      .map((p) => p.pricePerServingCents)
      .filter((v): v is number => v !== null);

    const hasFreeShipping = plans.some((p) => p.shippingCostCents === 0);

    await prisma.provider.update({
      where: { id: providerId },
      data: {
        minPricePerServingCents: servingPrices.length > 0 ? Math.min(...servingPrices) : null,
        maxPricePerServingCents: servingPrices.length > 0 ? Math.max(...servingPrices) : null,
        freeShipping: hasFreeShipping,
      },
    });

    revalidatePath(`/admin/providers/${providerId}/edit`);
  } catch {
    // Silently fail
  }
}

// -- Review Moderation --

export async function approveReview(formData: FormData): Promise<void> {
  const id = getString(formData, "id");
  if (!id) return;

  try {
    const review = await prisma.review.update({
      where: { id },
      data: { status: "APPROVED" },
      select: { providerId: true },
    });

    // Recalculate provider average rating and review count
    const aggregation = await prisma.review.aggregate({
      where: { providerId: review.providerId, status: "APPROVED" },
      _avg: { rating: true },
      _count: true,
    });

    await prisma.provider.update({
      where: { id: review.providerId },
      data: {
        averageRating: aggregation._avg.rating ?? 0,
        reviewCount: aggregation._count,
      },
    });

    revalidatePath("/admin/reviews");
  } catch {
    // Silently fail
  }
}

export async function rejectReview(formData: FormData): Promise<void> {
  const id = getString(formData, "id");
  if (!id) return;

  try {
    const review = await prisma.review.update({
      where: { id },
      data: { status: "REJECTED" },
      select: { providerId: true },
    });

    // Recalculate in case the review was previously approved
    const aggregation = await prisma.review.aggregate({
      where: { providerId: review.providerId, status: "APPROVED" },
      _avg: { rating: true },
      _count: true,
    });

    await prisma.provider.update({
      where: { id: review.providerId },
      data: {
        averageRating: aggregation._avg.rating ?? 0,
        reviewCount: aggregation._count,
      },
    });

    revalidatePath("/admin/reviews");
  } catch {
    // Silently fail
  }
}

// -- Blog CRUD --

export async function createBlogPost(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const errors: Record<string, string> = {};

  const title = getString(formData, "title");
  const slug = getString(formData, "slug") || slugify(title);
  const excerpt = getOptionalString(formData, "excerpt");
  const body = getString(formData, "body");
  const coverImageUrl = getOptionalString(formData, "coverImageUrl");
  const author = getOptionalString(formData, "author");
  const status = getString(formData, "status") || "DRAFT";
  const metaTitle = getOptionalString(formData, "metaTitle");
  const metaDescription = getOptionalString(formData, "metaDescription");

  if (!title) errors.title = "Title is required.";
  if (!slug) errors.slug = "Slug is required.";
  if (!body) errors.body = "Body content is required.";
  if (!isValidContentStatus(status)) errors.status = "Invalid status.";

  if (Object.keys(errors).length > 0) {
    return { success: false, message: "Please fix the errors below.", errors };
  }

  try {
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing) {
      return {
        success: false,
        message: "A blog post with this slug already exists.",
        errors: { slug: "This slug is already in use." },
      };
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt,
        body,
        coverImageUrl,
        author,
        status: status as ContentStatus,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        metaTitle,
        metaDescription,
      },
    });

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    redirect(`/admin/blog/${post.id}/edit`);
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    return {
      success: false,
      message: "Failed to create blog post.",
      errors: { general: "An unexpected error occurred." },
    };
  }
}

export async function updateBlogPost(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const errors: Record<string, string> = {};

  const id = getString(formData, "id");
  const title = getString(formData, "title");
  const slug = getString(formData, "slug");
  const excerpt = getOptionalString(formData, "excerpt");
  const body = getString(formData, "body");
  const coverImageUrl = getOptionalString(formData, "coverImageUrl");
  const author = getOptionalString(formData, "author");
  const status = getString(formData, "status") || "DRAFT";
  const metaTitle = getOptionalString(formData, "metaTitle");
  const metaDescription = getOptionalString(formData, "metaDescription");

  if (!id) errors.id = "Post ID is required.";
  if (!title) errors.title = "Title is required.";
  if (!slug) errors.slug = "Slug is required.";
  if (!body) errors.body = "Body content is required.";
  if (!isValidContentStatus(status)) errors.status = "Invalid status.";

  if (Object.keys(errors).length > 0) {
    return { success: false, message: "Please fix the errors below.", errors };
  }

  try {
    // Check slug uniqueness (exclude self)
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing && existing.id !== id) {
      return {
        success: false,
        message: "A blog post with this slug already exists.",
        errors: { slug: "This slug is already in use by another post." },
      };
    }

    // Get current post to handle publishedAt
    const current = await prisma.blogPost.findUnique({
      where: { id },
      select: { status: true, publishedAt: true },
    });

    let publishedAt = current?.publishedAt ?? null;
    if (status === "PUBLISHED" && !publishedAt) {
      publishedAt = new Date();
    }

    await prisma.blogPost.update({
      where: { id },
      data: {
        title,
        slug,
        excerpt,
        body,
        coverImageUrl,
        author,
        status: status as ContentStatus,
        publishedAt,
        metaTitle,
        metaDescription,
      },
    });

    revalidatePath("/admin/blog");
    revalidatePath(`/blog/${slug}`);
    revalidatePath("/blog");

    return {
      success: true,
      message: "Blog post updated successfully.",
      errors: {},
    };
  } catch {
    return {
      success: false,
      message: "Failed to update blog post.",
      errors: { general: "An unexpected error occurred." },
    };
  }
}

export async function deleteBlogPost(formData: FormData): Promise<void> {
  const id = getString(formData, "id");
  if (!id) return;

  try {
    await prisma.blogPost.delete({ where: { id } });
    revalidatePath("/admin/blog");
    revalidatePath("/blog");
  } catch {
    // Silently fail
  }

  redirect("/admin/blog");
}

// -- Collection CRUD --

export async function createCollection(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const errors: Record<string, string> = {};

  const title = getString(formData, "title");
  const slug = getString(formData, "slug") || slugify(title);
  const description = getOptionalString(formData, "description");
  const body = getOptionalString(formData, "body");
  const coverImageUrl = getOptionalString(formData, "coverImageUrl");
  const status = getString(formData, "status") || "DRAFT";
  const metaTitle = getOptionalString(formData, "metaTitle");
  const metaDescription = getOptionalString(formData, "metaDescription");

  // Parse items from form data
  const itemProviderIds = getStringArray(formData, "itemProviderId");
  const itemSortOrders = getStringArray(formData, "itemSortOrder");
  const itemNotes = getStringArray(formData, "itemNote");

  if (!title) errors.title = "Title is required.";
  if (!slug) errors.slug = "Slug is required.";
  if (!isValidContentStatus(status)) errors.status = "Invalid status.";

  if (Object.keys(errors).length > 0) {
    return { success: false, message: "Please fix the errors below.", errors };
  }

  try {
    const existing = await prisma.collection.findUnique({ where: { slug } });
    if (existing) {
      return {
        success: false,
        message: "A collection with this slug already exists.",
        errors: { slug: "This slug is already in use." },
      };
    }

    const items = itemProviderIds
      .map((providerId, i) => ({
        providerId,
        sortOrder: parseInt(itemSortOrders[i] ?? "0", 10) || 0,
        note: itemNotes[i]?.trim() || null,
      }))
      .filter((item) => item.providerId.length > 0);

    const collection = await prisma.collection.create({
      data: {
        title,
        slug,
        description,
        body,
        coverImageUrl,
        status: status as ContentStatus,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        metaTitle,
        metaDescription,
        items: {
          create: items,
        },
      },
    });

    revalidatePath("/admin/collections");
    revalidatePath("/best");
    redirect(`/admin/collections/${collection.id}/edit`);
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    return {
      success: false,
      message: "Failed to create collection.",
      errors: { general: "An unexpected error occurred." },
    };
  }
}

export async function updateCollection(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const errors: Record<string, string> = {};

  const id = getString(formData, "id");
  const title = getString(formData, "title");
  const slug = getString(formData, "slug");
  const description = getOptionalString(formData, "description");
  const body = getOptionalString(formData, "body");
  const coverImageUrl = getOptionalString(formData, "coverImageUrl");
  const status = getString(formData, "status") || "DRAFT";
  const metaTitle = getOptionalString(formData, "metaTitle");
  const metaDescription = getOptionalString(formData, "metaDescription");

  // Parse items
  const itemProviderIds = getStringArray(formData, "itemProviderId");
  const itemSortOrders = getStringArray(formData, "itemSortOrder");
  const itemNotes = getStringArray(formData, "itemNote");

  if (!id) errors.id = "Collection ID is required.";
  if (!title) errors.title = "Title is required.";
  if (!slug) errors.slug = "Slug is required.";
  if (!isValidContentStatus(status)) errors.status = "Invalid status.";

  if (Object.keys(errors).length > 0) {
    return { success: false, message: "Please fix the errors below.", errors };
  }

  try {
    // Check slug uniqueness (exclude self)
    const existing = await prisma.collection.findUnique({ where: { slug } });
    if (existing && existing.id !== id) {
      return {
        success: false,
        message: "A collection with this slug already exists.",
        errors: { slug: "This slug is already in use by another collection." },
      };
    }

    // Get current collection for publishedAt handling
    const current = await prisma.collection.findUnique({
      where: { id },
      select: { status: true, publishedAt: true },
    });

    let publishedAt = current?.publishedAt ?? null;
    if (status === "PUBLISHED" && !publishedAt) {
      publishedAt = new Date();
    }

    const items = itemProviderIds
      .map((providerId, i) => ({
        providerId,
        sortOrder: parseInt(itemSortOrders[i] ?? "0", 10) || 0,
        note: itemNotes[i]?.trim() || null,
      }))
      .filter((item) => item.providerId.length > 0);

    // Delete existing items and recreate
    await prisma.collectionItem.deleteMany({ where: { collectionId: id } });

    await prisma.collection.update({
      where: { id },
      data: {
        title,
        slug,
        description,
        body,
        coverImageUrl,
        status: status as ContentStatus,
        publishedAt,
        metaTitle,
        metaDescription,
        items: {
          create: items,
        },
      },
    });

    revalidatePath("/admin/collections");
    revalidatePath(`/best/${slug}`);
    revalidatePath("/best");

    return {
      success: true,
      message: "Collection updated successfully.",
      errors: {},
    };
  } catch {
    return {
      success: false,
      message: "Failed to update collection.",
      errors: { general: "An unexpected error occurred." },
    };
  }
}

export async function deleteCollection(formData: FormData): Promise<void> {
  const id = getString(formData, "id");
  if (!id) return;

  try {
    await prisma.collection.delete({ where: { id } });
    revalidatePath("/admin/collections");
    revalidatePath("/best");
  } catch {
    // Silently fail
  }

  redirect("/admin/collections");
}
