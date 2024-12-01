import { useState, useEffect } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import isEqual from "lodash/isEqual";
import { useQuery } from "@/utils/graphql";
import Table from "@/components/Table";
import TableSearch, { SearchSettings } from "@/components/TableSearch";
import TableDateSelector from "@/components/TableDateSelector";
import TableSearchFieldSelector from "@/components/TableSearchFieldSelector";
import { QueryConfig, useQueryBuilder } from "@/utils/queryBuilder";
import { ColDataCardDef } from "@/types/types";
import TableAdvancedSearchFilterMenu from "@/components/TableAdvancedSearchFilterMenu";
import TableAdvancedSearchFilterToggle from "@/components/TableAdvancedSearchFilterToggle";
import TablePaginationControls from "@/components/TablePaginationControls";
import { useActiveSwitchFilterCount } from "@/components/TableAdvancedSearchFilterToggle";
import TableResetFiltersToggle from "@/components/TableResetFiltersToggle";
import { ZodSchema } from "zod";

interface TableProps<T extends Record<string, unknown>> {
  columns: ColDataCardDef<T>[];
  initialQueryConfig: QueryConfig;
  localStorageKey: string;
  schema: ZodSchema<T>;
}

/**
 * The main abstracted table component with all the bells and whistles -
 * designed to interact with the Hasura GraphQL API
 */
export default function TableWrapper<T extends Record<string, unknown>>({
  initialQueryConfig,
  columns,
  localStorageKey,
  schema,
}: TableProps<T>) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [areFiltersDirty, setAreFiltersDirty] = useState(false);
  const [isLocalStorageLoaded, setIsLocalStorageLoaded] = useState(false);
  const [searchSettings, setSearchSettings] = useState<SearchSettings>({
    searchString: String(initialQueryConfig.searchFilter.value),
    searchColumn: initialQueryConfig.searchFilter.column,
  });
  const [queryConfig, setQueryConfig] = useState<QueryConfig>({
    ...initialQueryConfig,
  });

  const query = useQueryBuilder(queryConfig);

  const { data, isLoading, error } = useQuery({
    // dont fire first query until localstorage is loaded
    query: isLocalStorageLoaded ? query : null,
    schema,
    typename: queryConfig.tableName,
  });

  if (error) {
    console.error(error);
  }

  const activeFilterCount = useActiveSwitchFilterCount(queryConfig);

  const rows = data || [];

  /**
   * Load query config from local storage
   */
  useEffect(() => {
    const configFromStorageString = localStorage.getItem(localStorageKey) || "";
    try {
      const queryConfigFromStorage = JSON.parse(
        configFromStorageString
      ) as QueryConfig;
      // todo: validate with Zod
      // todo: bugs lurking here because the ytd/1y/5y filters need to be refreshed
      setIsLocalStorageLoaded(true);
      setQueryConfig(queryConfigFromStorage);
    } catch {
      setIsLocalStorageLoaded(true);
    }
  }, [localStorageKey]);

  /**
   * Keep changes to query config in sync with localstorage
   */
  useEffect(() => {
    if (isLocalStorageLoaded) {
      localStorage.setItem(localStorageKey, JSON.stringify(queryConfig));
    }
  }, [isLocalStorageLoaded, queryConfig, localStorageKey]);

  /**
   * Keep the search settings string in sync with queryConfig changes
   * this enables resetting the search input from a sibling component
   * (like the 'reset filters' button)
   */
  useEffect(() => {
    setSearchSettings({
      searchString: String(queryConfig.searchFilter.value),
      searchColumn: queryConfig.searchFilter.column,
    });
  }, [queryConfig.searchFilter]);

  /**
   * Manage dirty filter state to enable reset filters button
   */
  useEffect(() => {
    setAreFiltersDirty(!isEqual(queryConfig, initialQueryConfig));
  }, [queryConfig, initialQueryConfig]);

  /**
   * wait until the localstorage hook resolves to render anything
   * to prevent filter UI elements from jump
   */
  if (!isLocalStorageLoaded) {
    return;
  }

  return (
    <>
      {/* Table filter controls */}
      <form onSubmit={(e) => e.preventDefault()}>
        <Row className="mt-3 mb-2">
          <Col>
            <Row>
              <Col xs={12} md="auto" className="d-flex align-items-center">
                <TableSearchFieldSelector
                  queryConfig={queryConfig}
                  setQueryConfig={setQueryConfig}
                  searchSettings={searchSettings}
                  setSearchSettings={setSearchSettings}
                />
              </Col>
              <Col xs={12} md="auto" className="mt-sm-3 mt-md-0">
                <TableDateSelector
                  queryConfig={queryConfig}
                  setQueryConfig={setQueryConfig}
                />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col xs={12} md={6} className="d-flex justify-content-between">
            {queryConfig.filterCards?.length > 0 && (
              <TableAdvancedSearchFilterToggle
                setIsFilterOpen={setIsFilterOpen}
                activeFilterCount={activeFilterCount}
              />
            )}
            <TableSearch
              queryConfig={queryConfig}
              setQueryConfig={setQueryConfig}
              searchSettings={searchSettings}
              setSearchSettings={setSearchSettings}
            />
          </Col>
          <Col xs="auto">
            {areFiltersDirty && (
              <TableResetFiltersToggle
                queryConfig={initialQueryConfig}
                setQueryConfig={setQueryConfig}
              />
            )}
          </Col>
          <Col className="d-flex justify-content-end">
            <TablePaginationControls
              queryConfig={queryConfig}
              setQueryConfig={setQueryConfig}
              recordCount={rows.length}
              isLoading={isLoading}
            />
          </Col>
        </Row>
      </form>
      <Row
        className={
          isFilterOpen
            ? "special-filter special-filter-open"
            : " special-filter"
        }
      >
        <Col>
          <TableAdvancedSearchFilterMenu
            queryConfig={queryConfig}
            setQueryConfig={setQueryConfig}
          />
        </Col>
      </Row>
      {/* The actual table itself */}
      <Row>
        <Col>
          <Table<T>
            rows={rows}
            columns={columns}
            queryConfig={queryConfig}
            setQueryConfig={setQueryConfig}
          />
        </Col>
      </Row>
    </>
  );
}
