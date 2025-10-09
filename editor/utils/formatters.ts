import { format, parseISO } from "date-fns";
import { Crash } from "@/types/crashes";

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
 * Format date as: 2024-11-05 9:18 AM
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
 * Format primary and secondary addresses as: E MARTIN LUTHER KING JR BLVD & CHICON ST
 */
export const formatAddresses = (crash: Crash): string => {
  return `${crash.address_primary ? crash.address_primary : ""} ${
    crash.address_secondary ? "& " + crash.address_secondary : ""
  }`;
};
