import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createHash } from "crypto";
import { prisma } from "@/lib/db";

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

export async function GET(
  request: Request,
  props: { params: Promise<{ providerId: string }> },
) {
  const { providerId } = await props.params;

  // Look up the provider to get the redirect URL
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    select: { affiliateUrl: true, website: true },
  });

  if (!provider) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const redirectUrl = provider.affiliateUrl ?? provider.website;

  // Gather tracking data from request headers
  const headerStore = await headers();
  const referer = headerStore.get("referer");
  const userAgent = headerStore.get("user-agent");
  const forwardedFor = headerStore.get("x-forwarded-for");
  const realIp = headerStore.get("x-real-ip");

  // Determine client IP: x-forwarded-for first entry, then x-real-ip, then unknown
  const rawIp = forwardedFor?.split(",")[0]?.trim() ?? realIp ?? "unknown";
  const ipHash = hashIp(rawIp);

  // Extract source from query params
  const url = new URL(request.url);
  const source = url.searchParams.get("source") ?? referer ?? null;

  // Fire-and-forget: log the click without blocking the redirect
  prisma.affiliateClick
    .create({
      data: {
        providerId,
        source,
        referrer: referer,
        userAgent,
        ipHash,
      },
    })
    .catch(() => {
      // Silently fail -- click tracking should never block user navigation
    });

  return NextResponse.redirect(redirectUrl);
}
