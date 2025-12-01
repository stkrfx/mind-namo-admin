import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Ensure Redis connection variables exist
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// Create a generic rate limiter instance
// 5 requests per 60 seconds (Strict for actions like "Send Email")
const limiter = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      analytics: true,
      prefix: "@upstash/ratelimit",
    })
  : null;

/**
 * Checks the rate limit for a specific identifier (User ID or IP).
 * Throws an error if the limit is exceeded.
 * @param {string} identifier - unique key (e.g., user email or IP address)
 */
export async function checkRateLimit(identifier) {
  if (!redis || !limiter) {
    // If Redis isn't set up (e.g., dev mode without env), we skip rate limiting
    // preventing the app from crashing.
    return { success: true };
  }

  try {
    const result = await limiter.limit(identifier);

    if (!result.success) {
      throw new Error("Too many requests. Please try again later.");
    }

    return result;
  } catch (error) {
    // If it's the rate limit error we just threw, rethrow it
    if (error.message === "Too many requests. Please try again later.") {
      throw error;
    }
    // For connection errors, log but allow the request to proceed (fail open)
    console.error("Rate Limit Error:", error);
    return { success: true };
  }
}