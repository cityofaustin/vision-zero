import { format, parseISO } from "date-fns";

export const formatCostToDollars = cost =>
  !!cost ? `$${cost.toLocaleString()}` : "--";

export const formatDateTimeString = datetime =>
  format(parseISO(datetime), "yyyy-MM-dd hh:mm:ss a");
