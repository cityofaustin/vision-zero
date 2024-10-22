import { format, parseISO } from "date-fns";
import { TableColumn, LookupTableOption } from "@/types/types";

// const formatCostToDollars = (cost: number | null) =>
//   cost || cost === 0 ? `$${cost.toLocaleString()}` : "--";

export const formatDateTime = (value: unknown): string => {
  if (!value || typeof value !== "string") {
    return "";
  }
  return format(parseISO(value), "E d MMM yyyy h:mm a") || "";
};
