import { useMemo } from "react";
import { gql } from "graphql-request";

// todo: test quote escape

const BASE_QUERY_STRING = `
    query $queryName {
        $tableName(limit: $limit, order_by: $orderBy where: $where) {
            $columns
        }
    }`;

/**
 * Interface for a single filter that can be
 * converted into a graphql `where` expression
 */
interface FilterBase {
  /**
   * Arbitrary but must uniquely identify the filter by name amongst all
   * other filters in the same group
   */
  id: string;
  /**
   * Hasura comparison operator, e.g. _eq, _gte
   */
  operator: string;
  /**
   * The filter value
   */
  value: string | number;
  /**
   * The db column name to filter on
   */
  column: string;
  /**
   * If the filter should be wrapped with `%`
   * --should only be used with string types
   */
  wildcard?: boolean;
}

export interface StringFilter extends FilterBase {
  operator: "_ilike";
  value: string;
}

export interface DateFilter extends FilterBase {
  operator: "_gte" | "_lte";
}

interface FilterGroup {
  /**
   * The arbitrary ID must uniquely identifier of this group amongst
   * all other filter groups
   */
  id: string;
  groupOperator: "_and" | "_or";
  filters: (DateFilter | StringFilter)[];
}

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
   * The column name to be used in the `order_by` directive
   */
  sortColName: string;
  /**
   * Sort results ascending (true) or descending (false)
   */
  sortAsc: boolean;
  /**
   * The filter to be managed by a search input component.
   * The query buildler has special handling to include this
   * filter as any other filter group
   */
  searchFilter: StringFilter;
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
    filters: DateFilter[];
  };
  /**
   * Any additional optional filters. Advanced filter switches
   * would go here, for example.
   */
  filterGroups?: FilterGroup[];
}

/**
 * Utility function to extract a filter by ID
 *
 * todo: not in use anywhere
 */
export const getFilterById = (
  queryConfig: QueryConfig,
  groupId: string,
  filterId: string
): {
  groupIdx: number;
  filterIdx: number;
  filter: StringFilter | DateFilter | undefined;
} => {
  if (!queryConfig.filterGroups) {
    return { groupIdx: -1, filterIdx: -1, filter: undefined };
  }
  const groupIdx = queryConfig.filterGroups.findIndex(
    (group) => group.id === groupId
  );
  const group = groupIdx > -1 ? queryConfig.filterGroups[groupIdx] : undefined;

  if (!group) {
    return { groupIdx: -1, filterIdx: -1, filter: undefined };
  }

  const filterIdx = group
    ? group.filters.findIndex((f) => f.id === filterId)
    : -1;

  const filter = filterIdx > -1 ? group.filters[filterIdx] : undefined;

  return { groupIdx, filterIdx, filter };
};

/**
 * Wrap a value in `%` if it is a string and wildcard is true
 */
const maybeWildCardValue = (
  value: string | number,
  wildcard: boolean
): string | number => {
  if (!wildcard || typeof value !== "string") {
    return value;
  }
  return `%${value}%`;
};

/**
 * Escape double quotes in a value by first testing if it is a string
 */
const maybeQuoteEscapeValue = (value: string | number) =>
  typeof value === "string" ? `"${value.replace('"', '\\"')}"` : String(value);

/**
 * Get the order_by graphql expression, e.g. `{ case_id: desc }`
 */
const getOrderByExp = (sortColName: string, sortAsc: boolean): string => {
  return `{${sortColName}: ${sortAsc ? "asc" : "desc"}}`;
};

/**
 * Convert a filter into a Hasura graphql `where` expression.
 *
 * E.g.: `{ record_locator: { _ilike: "%elm st%" } }`
 */
const filterToWhereExp = (filter: StringFilter | DateFilter): string => {
  return `{ ${filter.column}: { ${filter.operator}: ${maybeQuoteEscapeValue(
    maybeWildCardValue(filter.value, !!filter.wildcard)
  )}}
      }`;
};

/**
 * Compile all filters into a single graphql `where` expression.
 *
 * Each group is accumulated by `_and` condition, while filters
 * within each group are accumulated by the `groupOperator`
 */
const getWhereExp = (filterGroups: FilterGroup[]): string => {
  // todo: exclude filters when value is empty? e.g. don't send search string filter always?
  const andExps = filterGroups
    .filter((group) => group.filters.length > 0)
    .map((group) => {
      const orExps = group.filters
        .map((filter) => filterToWhereExp(filter))
        .filter((x) => !!x);
      return `{ ${group.groupOperator}: [ ${orExps.join("\n")} ] }`;
    });

  const whereExp = `{ _and: [ ${andExps.join("\n")} ]}`;

  return whereExp;
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
const buildQuery = ({
  columns,
  tableName,
  limit,
  sortColName,
  sortAsc,
  filterGroups,
  dateFilter,
  searchFilter,
}: QueryConfig): string => {
  const columnString = columns.join("\n");

  // convert the search filter to a FilterGroup
  // and add to all filters
  const allFilterGroups: FilterGroup[] = [
    ...(filterGroups || []),
    { id: "search", filters: [searchFilter], groupOperator: "_and" },
  ];

  // convert the date filters to a FilterGroup
  // and add to all filters
  if (dateFilter) {
    allFilterGroups.push({
      id: "date_filters",
      filters: dateFilter.filters,
      groupOperator: "_and",
    });
  }

  const where = getWhereExp(allFilterGroups);
  const queryString = BASE_QUERY_STRING.replace(
    "$queryName",
    "BuildQuery_" + tableName
  )
    .replace("$tableName", tableName)
    .replace("$limit", String(limit))
    .replace("$orderBy", getOrderByExp(sortColName, sortAsc))
    .replace("$columns", columnString)
    .replace("$where", where);
  return gql`
    ${queryString}
  `;
};

/**
 * Hook which memoizes the graphql query from the
 * provided queryConfig
 */
export const useQueryBuilder = (queryConfig: QueryConfig): string =>
  useMemo(() => {
    return buildQuery(queryConfig);
  }, [queryConfig]);
