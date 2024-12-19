import { format, parseISO } from "date-fns";

// const formatCostToDollars = (cost: number | null) =>
//   cost || cost === 0 ? `$${cost.toLocaleString()}` : "--";

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
