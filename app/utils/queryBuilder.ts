import { useMemo } from "react";
import { gql } from "graphql-request";
import { produce } from "immer";
import { ColDataCardDef } from "@/types/types";
// todo: test quote escape

const BASE_QUERY_STRING = `
    query $queryName {
        $tableName(limit: $limit, offset: $offset, order_by: $orderBy where: $where) {
            $columns
        }
        $tableName_aggregate(where: $where) {
            aggregate {
                count
            }
        }
    }`;

/**
 * The types we currently support as filter values
 *
 */
type FilterValue = string | number | boolean | number[];

/**
 * Interface for a single filter that can be
 * converted into a graphql `where` expression
 */
export interface Filter {
  /**
   * Arbitrary but must uniquely identify the filter by name amongst all
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
   * The arbitrary ID must uniquely identifier of this group amongst
   * all other filter groups
   */
  id: string;
  /**
   * Optional label that can be used to label the filter cards
   */
  label?: string;
  /**
   * Applies to FilterCard's filter groups only—aka switches - it enables
   * switch filtegroups to be present in the config and ignored
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
 * Configuration object for the graphql
 * query builder
 */
export interface QueryConfig {
  /**
   * Column names to be returned by query
   */
  columns: string[];
  /**
   * Table (or view) name to query - todo: specify table schema?
   */
  tableName: string;
  /**
   * The record limit
   */
  limit: number;
  /**
   * The query offset (for pagination)
   */
  offset: number;
  /**
   * The column name to be used in the `order_by` directive
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
   * be compatible with the DateSeletor component which uses
   * pre-defiend date ranges as well as custom input
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
}

/**
 * Wrap a string in `%`
 */
const wildCardValue = (value: string): string => {
  return `%${value}%`;
};

/**
 * Wrap strings in quotes and escape double quotes
 * todo: do we need to escape anything else?
 */
const quoteWrapAndEscape = (value: string): FilterValue =>
  `"${value.replaceAll('"', '\\"')}"`;

/**
 * Create a string representation of an array of numbers
 * [1, 2]  => "[1, 2]"
 */
const arrayToStringRep = (arr: number[]): string => {
  return `[${arr}]`;
};

/**
 * Get the order_by graphql expression, e.g. `{ case_id: desc }`
 */
const getOrderByExp = (sortColName: string, sortAsc: boolean): string => {
  return `{${sortColName}: ${sortAsc ? "asc" : "desc"}}`;
};

/**
 * Stringify a filter value so that it can by embedded in
 * a graphql query string.
 */
const stringifyFilterValue = (value: FilterValue, wildcard?: boolean) => {
  if (typeof value === "string") {
    return quoteWrapAndEscape(wildcard ? wildCardValue(value) : value);
  } else if (Array.isArray(value)) {
    return arrayToStringRep(value);
  }
  return `${value}`;
};

/**
 * Convert a Filter object into a Hasura graphql `where`
 * expression string
 *
 * E.g.: `{ record_locator: { _ilike: "%elm st%" } }`
 */
const filterToWhereExp = (filter: Filter): string => {
  const comment = `\n # ${filter.id} \n`;
  const exp = `{ ${comment} ${filter.column}: { ${
    filter.operator
  }: ${stringifyFilterValue(filter.value, !!filter.wildcard)} } }`;
  if (filter.relationshipName) {
    // wrap filter string in relationship
    return `{ ${filter.relationshipName}:  ${exp} }`;
  }
  return exp;
};

/**
 * Return a graphql where expression string that aggregates
 * multiple filters — this function is recursive
 */
const filterGroupToWhereExp = (
  filterGroup: FilterGroup | null
): string | null => {
  if (!filterGroup) {
    return null;
  }
  let groupExp: (string | null)[] = [];
  if (filterGroup.filters) {
    groupExp = filterGroup.filters
      // create a where exp for each filter
      .map((filter) => filterToWhereExp(filter));
  } else if (filterGroup.filterGroups) {
    groupExp = filterGroup.filterGroups.map((nestedFilterGroup) =>
      filterGroupToWhereExp(nestedFilterGroup)
    );
  }
  const comment = `\n # ${filterGroup.id} \n`;

  if (groupExp.length === 0) {
    // this filter group was empty
    // return null
    return null;
  }
  return `{ ${comment} ${filterGroup.groupOperator}: [ ${groupExp.join(
    "\n"
  )} ] }`;
};

/**
 * Compile all filters into a single graphql `where` expression.
 *
 * Each group is accumulated by `_and` condition, while filters and
 * nested FilterGroups are accumulated by the `groupOperator`
 */
const getWhereExp = (filterGroups: FilterGroup[]): string => {
  const andExps = filterGroups
    .map((filterGroup) => filterGroupToWhereExp(filterGroup))
    // remove any null values, which are returned when a fitler group is empty
    .filter((x) => !!x);
  return andExps.length > 0 ? `{ _and: [ ${andExps.join("\n")} ]}` : "{}";
};

/**
 * Build a graphql query from the query config
 *
 * returns something like this:
 *   query BuildQuery_crashes_list_view {
 *    crashes_list_view(
 *      limit: 25
 *      order_by: { crash_timestamp: desc }
 *      where: { _and: [{ _or: [{ record_locator: { _ilike: "%T12345%" } }] }] }
 *    ) {
 *      record_locator
 *      case_id
 *      crash_timestamp
 *      address_primary
 *      collsn_desc
 *    }
 *  }
 */
const buildQuery = (
  {
    columns,
    tableName,
    limit,
    offset,
    sortColName,
    sortAsc,
    filterCards,
    dateFilter,
    searchFilter,
  }: QueryConfig,
  contextFilters?: Filter[]
): string => {
  const columnString = columns.join("\n");

  /**
   * Collect all filters into one big FilterGroup
   */
  const allFilterGroups: FilterGroup[] = [];

  /**
   * Shape search filter like a FilterGroup and add
   * to all filters
   */
  if (searchFilter.value !== "") {
    allFilterGroups.push({
      id: "search",
      filters: [searchFilter],
      groupOperator: "_and",
    });
  }

  /**
   * Shape date filters like a FilterGroup and add
   * to all filters
   */
  if (dateFilter && dateFilter.mode !== "all") {
    allFilterGroups.push({
      id: "date_filters",
      filters: dateFilter.filters,
      groupOperator: "_and",
    });
  }

  /**
   * Shape context filters like a FilterGroup and add
   * to all filters
   */
  if (contextFilters) {
    allFilterGroups.push({
      id: "context_filters",
      filters: contextFilters,
      groupOperator: "_and",
    });
  }

  /**
   * Add enabled switch filters to the filter group
   */
  if (filterCards) {
    const filterCardsWithActiveFilters: FilterGroup[] = [];
    filterCards.forEach((filterCard) => {
      // extract any enabled switches from this card
      const enabledSwitchFilters: FilterGroup[] | undefined =
        filterCard.filterGroups?.filter((switchFilter) => switchFilter.enabled);

      if (enabledSwitchFilters && enabledSwitchFilters.length > 0) {
        // construct a new filter group with only the enabled switches
        const newFilterCard = { ...filterCard };
        newFilterCard.filterGroups = enabledSwitchFilters;
        filterCardsWithActiveFilters.push(newFilterCard);
      }
    });
    allFilterGroups.push(...filterCardsWithActiveFilters);
  }

  const where = getWhereExp(allFilterGroups);

  const queryString = BASE_QUERY_STRING.replace(
    "$queryName",
    "BuildQuery_" + tableName
  )
    .replaceAll("$tableName", tableName)
    .replace("$limit", String(limit))
    .replace("$offset", String(offset))
    .replace("$orderBy", getOrderByExp(sortColName, sortAsc))
    .replace("$columns", columnString)
    .replaceAll("$where", where);
  return gql`
    ${queryString}
  `;
};

/**
 * Hook which builds a memoized graphql query from the query configuration
 * @param {QueryConfig} queryConfig - the QueryConfig object
 * @param {Filter[]} contextFilters - an optional filter array to be included the
 * query's `where` expression. It is expected that these filters would be set from
 * an app context that is not wanted to be kepts in local storage, such as a
 * URL query param
 * @returns {string} a graphql querry
 */
export const useQueryBuilder = (
  queryConfig: QueryConfig,
  contextFilters?: Filter[]
): string =>
  useMemo(() => {
    return buildQuery(queryConfig, contextFilters);
  }, [queryConfig]);

/**
 * Hook which builds a graphql query for record exporting
 */
export const useExportQuery = <T extends Record<string, unknown>>(
  queryConfig: QueryConfig,
  columns: ColDataCardDef<T>[],
  contextFilters?: Filter[]
): string => {
  const newQueryConfig = useMemo(() => {
    // update the provided query with export settings
    return produce(queryConfig, (newQueryConfig) => {
      // get exportable columns
      newQueryConfig.columns = columns
        .filter((col) => col.exportable)
        .map((col) => col.path);
      // reset limit and offset
      newQueryConfig.limit = 1_000_000;
      newQueryConfig.offset = 0;
      return newQueryConfig;
    });
  }, [queryConfig]);
  return useQueryBuilder(newQueryConfig, contextFilters);
};
