import { format, parseISO } from "date-fns";

/**
 * Format a number as a string with a dollar sign
 */
export const formatDollars = (cost: unknown | null): string => {
  if (typeof cost !== "number") {
    return "";
  }
  return `$${cost.toLocaleString()}`;
};

/**
 * Format date as: Tue 5 Nov 2024 9:18 AM
 */
export const formatDateTime = (value: unknown): string => {
  if (!value || typeof value !== "string") {
    return "";
  }
  return format(parseISO(value), "E d MMM yyyy h:mm a") || "";
};

/**
 * Format date as: 2024-01-01
 */
export const formatDate = (value: unknown): string => {
  if (!value || typeof value !== "string") {
    return "";
  }
  return format(parseISO(value), "yyyy-MM-dd") || "";
};

/**
 * Format date as: 2025-01-13 4.33.36 PM
 */
export const formatFileTimestamp = (date: Date): string => {
  return format(date, "yyyy-MM-dd h.mm.ss a");
};

/**
 * Return morning, afternoon, or evening
 */
export const formatGreetingTime = (
  date: Date
): "morning" | "afternoon" | "evening" => {
  const hours = date.getHours();
  if (hours >= 5 && hours < 12) {
    return "morning";
  } else if (hours >= 12 && hours < 18) {
    return "afternoon";
  } else {
    return "evening";
  }
};

