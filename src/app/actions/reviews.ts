"use server";

import { headers } from "next/headers";
import { createHash } from "crypto";
import { prisma } from "@/lib/db";

// -- Types --

interface ReviewFormErrors {
  rating?: string;
  body?: string;
  authorName?: string;
  authorEmail?: string;
  general?: string;
}

export interface ReviewFormState {
  success: boolean;
  message: string;
  errors: ReviewFormErrors;
}

// -- Helpers --

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

function validateEmail(email: string): boolean {
  // Basic email validation: must have @ with text before and after, and a dot in the domain
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function getClientIpHash(): Promise<string | null> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  const realIp = headerStore.get("x-real-ip");

  const ip = forwarded?.split(",")[0]?.trim() ?? realIp ?? null;
  if (!ip) return null;

  return hashIp(ip);
}

async function isRateLimited(ipHash: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const recentReviewCount = await prisma.review.count({
    where: {
      ipHash,
      createdAt: { gte: oneHourAgo },
    },
  });

  return recentReviewCount >= 3;
}

// -- Server Action --

export async function submitReview(
  _prevState: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  // Check honeypot field — bots typically fill this in
  const honeypot = formData.get("website_url");
  if (honeypot && typeof honeypot === "string" && honeypot.length > 0) {
    // Return a fake success to not tip off bots
    return {
      success: true,
      message: "Thank you! Your review is pending approval.",
      errors: {},
    };
  }

  // Extract fields
  const providerId = formData.get("providerId");
  const ratingRaw = formData.get("rating");
  const title = formData.get("title");
  const body = formData.get("body");
  const authorName = formData.get("authorName");
  const authorEmail = formData.get("authorEmail");

  // Validate
  const errors: ReviewFormErrors = {};

  // Provider ID must exist
  if (!providerId || typeof providerId !== "string") {
    return {
      success: false,
      message: "Invalid submission.",
      errors: { general: "Missing provider information." },
    };
  }

  // Rating: must be 1-5
  const rating = Number(ratingRaw);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.rating = "Please select a rating between 1 and 5.";
  }

  // Body: required, min 10 chars
  const bodyStr = typeof body === "string" ? body.trim() : "";
  if (bodyStr.length === 0) {
    errors.body = "Please write a review.";
  } else if (bodyStr.length < 10) {
    errors.body = "Your review must be at least 10 characters.";
  } else if (bodyStr.length > 5000) {
    errors.body = "Your review must be under 5,000 characters.";
  }

  // Author name: required, min 2 chars
  const authorNameStr = typeof authorName === "string" ? authorName.trim() : "";
  if (authorNameStr.length === 0) {
    errors.authorName = "Please enter your name.";
  } else if (authorNameStr.length < 2) {
    errors.authorName = "Name must be at least 2 characters.";
  } else if (authorNameStr.length > 100) {
    errors.authorName = "Name must be under 100 characters.";
  }

  // Author email: optional, but if provided must be valid
  const authorEmailStr =
    typeof authorEmail === "string" ? authorEmail.trim() : "";
  if (authorEmailStr.length > 0 && !validateEmail(authorEmailStr)) {
    errors.authorEmail = "Please enter a valid email address.";
  }

  // Title: optional, max length
  const titleStr = typeof title === "string" ? title.trim() : "";
  if (titleStr.length > 200) {
    errors.body = "Title must be under 200 characters.";
  }

  // Return validation errors
  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Please fix the errors below.",
      errors,
    };
  }

  // Rate limiting
  const ipHash = await getClientIpHash();
  if (ipHash) {
    const limited = await isRateLimited(ipHash);
    if (limited) {
      return {
        success: false,
        message: "Too many reviews submitted. Please try again later.",
        errors: {
          general:
            "You have reached the maximum number of reviews per hour. Please wait before submitting another.",
        },
      };
    }
  }

  // Verify the provider exists
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    select: { id: true },
  });

  if (!provider) {
    return {
      success: false,
      message: "Invalid submission.",
      errors: { general: "Provider not found." },
    };
  }

  // Create the review
  try {
    await prisma.review.create({
      data: {
        providerId,
        authorName: authorNameStr,
        authorEmail: authorEmailStr || null,
        rating,
        title: titleStr || null,
        body: bodyStr,
        status: "PENDING",
        ipHash,
      },
    });
  } catch {
    return {
      success: false,
      message: "Something went wrong. Please try again.",
      errors: { general: "Unable to submit your review. Please try again." },
    };
  }

  return {
    success: true,
    message: "Thank you! Your review is pending approval.",
    errors: {},
  };
}
