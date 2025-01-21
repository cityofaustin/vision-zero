import { useState, useEffect, useMemo } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";
import isEqual from "lodash/isEqual";
import { useQuery } from "@/utils/graphql";
import Table from "@/components/Table";
import TableSearch, { SearchSettings } from "@/components/TableSearch";
import TableDateSelector from "@/components/TableDateSelector";
import TableSearchFieldSelector from "@/components/TableSearchFieldSelector";
import { useQueryBuilder, useExportQuery } from "@/utils/queryBuilder";
import { QueryConfig, Filter } from "@/types/queryBuilder";
import { ColDataCardDef } from "@/types/types";
import TableAdvancedSearchFilterMenu from "@/components/TableAdvancedSearchFilterMenu";
import TableAdvancedSearchFilterToggle from "@/components/TableAdvancedSearchFilterToggle";
import TableExportModal from "@/components/TableExportModal";
import TablePaginationControls from "@/components/TablePaginationControls";
import { useActiveSwitchFilterCount } from "@/components/TableAdvancedSearchFilterToggle";
import TableResetFiltersToggle from "@/components/TableResetFiltersToggle";

interface TableProps<T extends Record<string, unknown>> {
  columns: ColDataCardDef<T>[];
  /**
   * An initial QueryConfig to be used by default — will be overwritten
   * by config fetched from localstorage
   */
  initialQueryConfig: QueryConfig;
  /**
   * The key to use when saving + loading the QueryConfig from localstorage
   */
  localStorageKey: string;
  /**
   *  an optional filter array to be included the query's `where` expression.
   * It is expected that these filters would be set from an app context that
   * is not wanted to be kept in local storage, such as a URL query param
   */
  contextFilters?: Filter[];
  /**
   * A switch that can be used to force a refetch() of the data - refect()
   * will be called anytime this prop changes
   */
  refetch?: boolean;
}

/**
 * The main abstracted table component with all the bells and whistles -
 * designed to interact with the Hasura GraphQL API
 */
export default function TableWrapper<T extends Record<string, unknown>>({
  initialQueryConfig,
  columns,
  localStorageKey,
  contextFilters,
  refetch: _refetch,
}: TableProps<T>) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [areFiltersDirty, setAreFiltersDirty] = useState(false);
  const [isLocalStorageLoaded, setIsLocalStorageLoaded] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [searchSettings, setSearchSettings] = useState<SearchSettings>({
    searchString: String(initialQueryConfig.searchFilter.value),
    searchColumn: initialQueryConfig.searchFilter.column,
  });
  const [queryConfig, setQueryConfig] = useState<QueryConfig>({
    ...initialQueryConfig,
  });

  const visibleColumns = useMemo(
    () => columns.filter((col) => !col.exportOnly),
    [columns]
  );
  const query = useQueryBuilder(queryConfig, visibleColumns, contextFilters);
  const exportQuery = useExportQuery(queryConfig, columns, contextFilters);

  const { data, aggregateData, isLoading, error, refetch } = useQuery<T>({
    // don't fire first query until localstorage is loaded
    query: isLocalStorageLoaded ? query : null,
    typename: queryConfig.tableName,
    hasAggregates: true,
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
   * Hook to trigger refetch
   */
  useEffect(() => {
    refetch();
  }, [_refetch, refetch]);
  /**
   * wait until the localstorage hook resolves to render anything
   * to prevent filter UI elements from jumping
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
              <Col xs={12} md="auto" className="align-items-center">
                <TableDateSelector
                  queryConfig={queryConfig}
                  setQueryConfig={setQueryConfig}
                />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col xs={12} md={6} className="d-flex justify-content-start mt-2">
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
          {areFiltersDirty && (
            <Col className="px-0 mt-2" xs="auto">
              <TableResetFiltersToggle
                queryConfig={initialQueryConfig}
                setQueryConfig={setQueryConfig}
              />
            </Col>
          )}
          <Col className="d-flex justify-content-end align-items-center mt-2">
            {isLoading && <Spinner variant="primary" />}
          </Col>
          <Col className="d-flex justify-content-end mt-2" xs="auto">
            <TablePaginationControls
              queryConfig={queryConfig}
              setQueryConfig={setQueryConfig}
              recordCount={rows.length}
              isLoading={isLoading}
              totalRecordCount={aggregateData?.aggregate?.count || 0}
              onClickDownload={() => setShowExportModal(true)}
              exportable={Boolean(queryConfig.exportable)}
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
            columns={visibleColumns}
            queryConfig={queryConfig}
            setQueryConfig={setQueryConfig}
          />
        </Col>
      </Row>
      {queryConfig.exportable && (
        <TableExportModal<T>
          exportFilename={queryConfig.exportFilename}
          onClose={() => setShowExportModal(false)}
          query={exportQuery}
          show={showExportModal}
          totalRecordCount={aggregateData?.aggregate?.count || 0}
          typename={queryConfig.tableName}
        />
      )}
    </>
  );
}
