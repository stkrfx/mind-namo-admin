import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import authConfig from "./auth.config";

// Initialize NextAuth
const { auth } = NextAuth(authConfig);

// Initialize Upstash Redis for Rate Limiting
// We verify env vars exist to prevent crash during build/dev if not set
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// Create Rate Limiter (10 requests per 60 seconds per IP for auth routes)
// This is strict enough to stop brute force, but lenient enough for humans
const ratelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      analytics: true,
    })
  : null;

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isUploadThingRoute = nextUrl.pathname.startsWith("/api/uploadthing");
  const isSeedRoute = nextUrl.pathname.startsWith("/api/seed-admin");
  
  // Routes that require Rate Limiting (Security)
  const isSensitiveAuthRoute = 
    nextUrl.pathname === "/login" || 
    nextUrl.pathname === "/forgot-password" ||
    nextUrl.pathname.startsWith("/reset-password");

  // Routes that are protected (Admin Dashboard)
  // We assume everything is protected except auth routes and specific APIs
  const isauthRoute = 
    nextUrl.pathname === "/login" || 
    nextUrl.pathname === "/forgot-password" ||
    nextUrl.pathname.startsWith("/reset-password");

  // 1. RATE LIMITING LOGIC
  if (isSensitiveAuthRoute && ratelimit) {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    if (!success) {
      return new NextResponse("Too Many Requests. Please try again in a minute.", {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      });
    }
  }

  // 2. AUTHENTICATION LOGIC

  // Always allow API routes for Auth (internal), UploadThing, and Seeding
  if (isApiAuthRoute || isUploadThingRoute || isSeedRoute) {
    return null;
  }

  // If on an Auth route (Login, etc.)
  if (isauthRoute) {
    if (isLoggedIn) {
      // If already logged in, redirect to dashboard
      return Response.redirect(new URL("/dashboard", nextUrl));
    }
    // If not logged in, allow access to login page
    return null;
  }

  // If not logged in and trying to access protected routes (Dashboard, etc.)
  if (!isLoggedIn) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    return Response.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
  }

  return null;
});

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};