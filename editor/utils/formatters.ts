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
export const formatDateTimeWithDay = (value: unknown): string => {
  if (!value || typeof value !== "string") {
    return "";
  }
  return format(parseISO(value), "E d MMM yyyy h:mm a") || "";
};

/**
 * Format date as: 2024-11-05 9:18 AM
 */
export const formatIsoDateTime = (value: unknown): string => {
  if (!value || typeof value !== "string") {
    return "";
  }
  return format(parseISO(value), "yyyy-MM-dd h:mm a") || "";
};

/**
 * Format date as: 08/24/2025 8:57 PM — Sun
 */
export const formatIsoDateTimeWithDay = (value: unknown): string => {
  if (!value || typeof value !== "string") {
    return "";
  }
  return format(parseISO(value), "MM/dd/yyyy h:mm a — E") || "";
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
 * Format time as: 12:30 PM
 */
export const formatTime = (value: unknown): string => {
  if (!value || typeof value !== "string") {
    return "";
  }
  return format(parseISO(value), "h:mm a") || "";
};

/**
 * Format year as: 2025
 */
export const formatYear = (value: unknown): string => {
  if (!value || typeof value !== "string") {
    return "";
  }
  return format(parseISO(value), "yyyy") || "";
};

/**
 * Format date as: 2025-01-13 4.33.36 PM
 */
export const formatFileTimestamp = (date: Date): string => {
  return format(date, "yyyy-MM-dd h.mm.ss a");
};

/**
 * Format an array of values to a comma-separated-string, removing
 * null, undefined, and empty strings
 */
export const formatArrayToString = (value: unknown): string => {
  if (value && Array.isArray(value)) {
    return value
      .filter((val) => val !== undefined && val !== null && val !== "")
      .map((val) => String(val))
      .join(", ");
  }
  return "";
};

/**
 * Format a user name from an email address or other string value.
 * Attempts to create a readable display name by:
 * - Extracting the local part of email addresses
 * - Converting dots to spaces
 * - Capitalizing words appropriately
 * - Stripping out numeric suffixes gracefully
 */
export const formatUserNameFromEmail = (value: unknown): string => {
  if (!value || typeof value !== "string") {
    return String(value);
  }

  // Extract the local part (before @) if it's an email
  const localPart = value.split("@")[0];

  // Replace dots with spaces
  let formatted = localPart.replace(/\./g, " ").trim();

  // Capitalize each word (space-separated)
  formatted = formatted
    .split(" ")
    .map((word) => {
      // Handle hyphenated names by capitalizing each part
      return word
        .split("-")
        .map((part) => {
          // Capitalize first letter, lowercase the rest
          return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        })
        .join("-");
    })
    .join(" ");

  // Strip trailing digits from the entire formatted string (e.g.)
  formatted = formatted.replace(/\d+$/, "").trim();

  return formatted;
};
