import { TableMapConfig } from "@/types/tableMapConfig";
import { AllowedPageSize, ExportPageSize } from "@/utils/constants";

/**
 * The types we currently support as filter values
 *
 */
export type FilterValue = string | number | boolean | number[];

/**
 * Interface for a single filter that can be
 * converted into a graphql `where` expression
 */
export interface Filter {
  /**
   * This arbitrary ID must uniquely identify the filter amongst all
   * other filters in the same group
   */
  id: string;
  /**
   * Hasura comparison operator, e.g. _eq, _gte
   */
  operator:
    | "_gte"
    | "_lte"
    | "_gt"
    | "_eq"
    | "_neq"
    | "_is_null"
    | "_ilike"
    | "_in"
    | "_nin";
  /**
   * The filter value
   */
  value: FilterValue;
  /**
   * The db column name to filter on
   */
  column: string;
  /**
   * The optional name of a relationship to use when constructing the filter string
   */
  relationshipName?: string;
  /**
   * If the filter should be wrapped with `%`
   * --should only be used with string types
   */
  wildcard?: boolean;
}

interface FilterGroupBase {
  /**
   * This arbitrary ID must uniquely identify this group amongst
   * all other filter groups
   */
  id: string;
  /**
   * Optional label that can be used to label the filter cards
   */
  label?: string;
  /**
   * Applies to FilterCard's filter groups only—aka switches - it enables
   * switch filter groups to be present in the config and ignored
   * by the queryBuilder until they are enabled. So this setting
   * is also used to control the switch UI component state
   */
  enabled?: boolean;
  /**
   *  Applies to FilterCard's filter groups only—aka switches—and causes
   * the switch behavior to render as checked/on when disabled and
   * unchecked/off when enabled. The main use case atm is to apply
   * the in_austin_full_purpose by default
   */
  inverted?: boolean;
  /**
   * The and/or operator that will be applied to this group of filters
   * when constructing the `where` expression
   */
  groupOperator: "_and" | "_or";
}

interface FilterGroupWithFilters extends FilterGroupBase {
  filters: Filter[];
  filterGroups?: never;
}

interface FilterGroupWithFilterGroups extends FilterGroupBase {
  filters?: never;
  filterGroups: FilterGroup[];
}

// todo: more documentation here
// todo: actually, make filters a union of FilterGroup[] or Filter[]? seems easier to grok
export type FilterGroup = FilterGroupWithFilterGroups | FilterGroupWithFilters;

/**
 * Defines the fields available to be selected from the search field selector
 */
export interface SearchFilterField {
  label: string;
  value: string;
}

/**
 * Used by the date selector component to keep shorthand
 * `mode` buttons (YTD, 1Y, etc) in sync with the actual
 * DateFilter[] array
 */
export type DateFilterMode = "ytd" | "all" | "5y" | "1y" | "custom";

/**
 * Configuration object for the graphql query builder
 */
export interface QueryConfig {
  /**
   * Table (or view) name to query - todo: specify table schema?
   */
  tableName: string;
  /**
   * The record limit
   */
  limit: AllowedPageSize | ExportPageSize;
  /**
   * The query offset (for pagination)
   */
  offset: number;
  /**
   * The column name to be used in the `order_by` argument
   */
  sortColName: string;
  /**
   * Sort results ascending (true) or descending (false)
   */
  sortAsc: boolean;
  /**
   * The filter to be managed by the search component.
   * The query buildler has special handling to apply this
   * filter when its value is not an empty string
   */
  searchFilter: Filter;
  /**
   * The search fields that are available to select from when searching
   */
  searchFields: SearchFilterField[];
  /**
   * The filter settings for filtering by date. Designed to
   * be compatible with the DateSelector component which uses
   * pre-defined date ranges as well as custom input
   */
  dateFilter?: {
    mode: DateFilterMode;
    /** Column name setting here will determine which column
     * name will will be used in the DateFilters[] that
     * are constructed by the UI component
     */
    column: string;
    filters: Filter[];
  };
  /**
   * Groups of filter card configs, which are meant to hold the filters
   * managed by the advanced filter component
   */
  filterCards: FilterGroup[];
  /**
   * Enables the export functionality
   */
  exportable?: boolean;
  /**
   * The name that will be given to the exported file, excluding
   * the file extension
   */
  exportFilename?: string;
  /**
   * Optional map configuration. Enables the map view/toggle when present
   */
  mapConfig?: TableMapConfig;
}

/**
 * Recursive type to loosely describe a graphQL field
 * selection set as JSON. This type is used when
 * building out the column string for a graphql query
 * based on the columns' paths
 *
 * @example
 * {
 *    "record_locator": {},
 *    "est_comp_cost_crash_based": {},
 *    "recommendation": {
 *        "rec_text": {}
 *    }
 * }
 */
export interface GraphQLFieldTree {
  [key: string]: GraphQLFieldTree;
}
