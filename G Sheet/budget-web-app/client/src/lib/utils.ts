import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format amount in cents to currency string
 * @param cents Amount in cents (e.g., 5000 = R50.00)
 * @returns Formatted currency string (e.g., "R50.00")
 */
export function formatCurrency(cents: number): string {
  const rands = cents / 100;
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(rands);
}

/**
 * Parse currency string to cents
 * @param value Currency string (e.g., "50.00" or "R50.00")
 * @returns Amount in cents (e.g., 5000)
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const dollars = parseFloat(cleaned) || 0;
  return Math.round(dollars * 100);
}

/**
 * Format date to readable string
 * @param date Date object
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

/**
 * Get current month in YYYY-MM format
 */
export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Get month in YYYY-MM format from date
 */
export function getMonthFromDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
