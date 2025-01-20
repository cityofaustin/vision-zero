import { useMemo } from "react";
import { gql } from "graphql-request";
import { produce } from "immer";
import { MAX_RECORD_EXPORT_LIMIT } from "./constants";
import {
  Filter,
  FilterValue,
  FilterGroup,
  QueryConfig,
} from "@/types/queryBuilder";
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
const buildQuery = <T extends Record<string, unknown>>(
  queryConfig: QueryConfig,
  columns: ColDataCardDef<T>[],
  contextFilters?: Filter[]
): string => {
  const {
    tableName,
    limit,
    offset,
    sortColName,
    sortAsc,
    filterCards,
    dateFilter,
    searchFilter,
  } = queryConfig;

  const columnString = columns.map((col) => col.path).join("\n");
 
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
export const useQueryBuilder = <T extends Record<string, unknown>>(
  queryConfig: QueryConfig,
  columns: ColDataCardDef<T>[],
  contextFilters?: Filter[]
): string =>
  useMemo(() => {
    return buildQuery(queryConfig, columns, contextFilters);
  }, [queryConfig, contextFilters]);

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
      // reset limit and offset
      newQueryConfig.limit = MAX_RECORD_EXPORT_LIMIT;
      newQueryConfig.offset = 0;
      return newQueryConfig;
    });
  }, [queryConfig]);
  return useQueryBuilder(newQueryConfig, columns, contextFilters);
};
