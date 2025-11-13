/**
 * These schema are analogous to the queryBuilder types and
 * need to be kept in sync in order to validate the queryConfig
 * that is parsed from local storage
 */
import { TableMapConfigSchema } from "@/schema/tableMapConfig";
import { z } from "zod";

// Base types
const FilterValue = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.number()),
]);

const Filter = z.object({
  id: z.string(),
  operator: z.enum([
    "_gte",
    "_lte",
    "_lt",
    "_gt",
    "_eq",
    "_neq",
    "_is_null",
    "_ilike",
    "_in",
    "_nin",
  ]),
  value: FilterValue,
  column: z.string(),
  relationshipName: z.string().optional(),
  wildcard: z.boolean().optional(),
});

const SearchFilterField = z.object({
  label: z.string(),
  value: z.string(),
});

const DateFilterMode = z.enum(["ytd", "all", "5y", "1y", "custom"]);

// FilterGroup schema with recursive type
const FilterGroupBase = z.object({
  id: z.string(),
  label: z.string().optional(),
  enabled: z.boolean().optional(),
  inverted: z.boolean().optional(),
  groupOperator: z.enum(["_and", "_or"]),
});

type FilterGroupType = z.infer<typeof FilterGroupBase> &
  (
    | { filters: z.infer<typeof Filter>[]; filterGroups?: never }
    | { filters?: never; filterGroups: FilterGroupType[] }
  );

const FilterGroup: z.ZodType<FilterGroupType> = FilterGroupBase.and(
  z.union([
    z.object({
      filters: z.array(Filter),
      filterGroups: z.never().optional(),
    }),
    z.object({
      filters: z.never().optional(),
      filterGroups: z.lazy(() => z.array(FilterGroup)),
    }),
  ])
);

const DateFilter = z.object({
  mode: DateFilterMode,
  column: z.string(),
  filters: z.array(Filter),
});

// Main QueryConfig schema
export const QueryConfigSchema = z.object({
  _version: z.number(),
  tableName: z.string(),
  limit: z.number(),
  offset: z.number(),
  sortColName: z.string(),
  sortAsc: z.boolean(),
  searchFilter: Filter,
  searchFields: z.array(SearchFilterField),
  dateFilter: DateFilter.optional(),
  filterCards: z.array(FilterGroup),
  exportable: z.boolean().optional(),
  exportFilename: z.string().optional(),
  mapConfig: TableMapConfigSchema.strict().optional(),
});
