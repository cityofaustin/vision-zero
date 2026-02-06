export const DEFAULT_QUERY_LIMIT = 50;
export const MAX_RECORD_EXPORT_LIMIT = 1_000_000;
export type ExportPageSize = typeof MAX_RECORD_EXPORT_LIMIT;

export const COLORS = {
  primary: "#1276d1",
  danger: "#dd0426",
  warning: "#ffd22f",
};

export const ALLOWED_QUERY_PAGE_SIZES = [10, 50, 250, 1000] as const;
export type AllowedPageSize = (typeof ALLOWED_QUERY_PAGE_SIZES)[number];
