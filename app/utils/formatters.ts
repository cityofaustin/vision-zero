import { format, parseISO } from "date-fns";

export const formatCostToDollars = (cost: number | null) =>
  cost || cost === 0 ? `$${cost.toLocaleString()}` : "--";

export const formatDateTime = (datetime: string | null) =>
  datetime ? format(parseISO(datetime), "E d MMM yyyy h:mm a") : "";
