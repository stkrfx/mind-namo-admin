import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes efficiently.
 * Uses clsx for conditional classes and tailwind-merge to resolve conflicts.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number into a currency string.
 * Default is AUD (Australian Dollar) as per your requirements.
 */
export function formatPrice(price, currency = "AUD") {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: currency,
  }).format(price);
}

/**
 * Formats a date object or string into a readable format.
 * Example: "Oct 24, 2025"
 */
export function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/**
 * Formats a date for display in tables including time.
 * Example: "Oct 24, 2025 at 2:30 PM"
 */
export function formatDateTime(date) {
  if (!date) return "";
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(d);
}

/**
 * Helper to generate an absolute URL for the app (used in emails).
 */
export function absoluteUrl(path) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
}

/**
 * Generates a random username (e.g., user_x82ka1)
 * Used when creating new Experts/Users who haven't set one yet.
 */
export function generateRandomUsername(role = "user") {
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${role}_${randomSuffix}`;
}

/**
 * Simulates a delay (useful for testing Suspense/Loading states)
 */
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));