import { useState, useEffect, useMemo } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";
import isEqual from "lodash/isEqual";
import cloneDeep from "lodash/cloneDeep";
import { useQuery } from "@/utils/graphql";
import Table from "@/components/Table";
import TableSearch, { SearchSettings } from "@/components/TableSearch";
import TableDateSelector from "@/components/TableDateSelector";
import { makeDateFilterFromMode } from "@/utils/dates";
import TableSearchFieldSelector from "@/components/TableSearchFieldSelector";
import { useQueryBuilder, useExportQuery } from "@/utils/queryBuilder";
import { QueryConfig, Filter } from "@/types/queryBuilder";
import { ColDataCardDef, ColumnVisibilitySetting } from "@/types/types";
import TableAdvancedSearchFilterMenu from "@/components/TableAdvancedSearchFilterMenu";
import TableAdvancedSearchFilterToggle from "@/components/TableAdvancedSearchFilterToggle";
import TableExportModal from "@/components/TableExportModal";
import TablePaginationControls from "@/components/TablePaginationControls";
import { useActiveSwitchFilterCount } from "@/components/TableAdvancedSearchFilterToggle";
import TableResetFiltersToggle from "@/components/TableResetFiltersToggle";
import { QueryConfigSchema } from "@/schema/queryBuilder";

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
   * A switch that can be used to force a refetch() of the data - refetch()
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
  const [isQueryConfigLocalStorageLoaded, setIsQueryConfigLocalStorageLoaded] =
    useState(false);
  const [
    isColVisibilityLocalStorageLoaded,
    setIsColVisibilityLocalStorageLoaded,
  ] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  /**
   * Initialize column visibility from provided columns
   */
  const [columnVisibilitySettings, setColumnVisibilitySettings] = useState<
    ColumnVisibilitySetting[]
  >(
    columns
      .filter((col) => !col.exportOnly)
      .map((col) => ({
        path: String(col.path),
        isVisible: !col.defaultHidden,
        label: col.label,
      }))
  );
  const [searchSettings, setSearchSettings] = useState<SearchSettings>({
    searchString: String(initialQueryConfig.searchFilter.value),
    searchColumn: initialQueryConfig.searchFilter.column,
  });
  const [queryConfig, setQueryConfig] = useState<QueryConfig>({
    ...initialQueryConfig,
  });

  /**
   * Construct the table's visibile columns
   */
  const visibleColumns = useMemo(
    () =>
      columns.filter((col) => {
        const colFromVisibilitySettings = columnVisibilitySettings.find(
          (visibleColumn) => visibleColumn.path === col.path
        );
        /**
         * if a matching column is found in the visibility settings, use it
         * otherwise the column is visible unless it's exportOnly or defaultHidden
         */
        return colFromVisibilitySettings
          ? colFromVisibilitySettings.isVisible
          : !col.exportOnly && !col.defaultHidden;
      }),
    [columns, columnVisibilitySettings]
  );

  const query = useQueryBuilder(
    queryConfig,
    visibleColumns,
    true,
    contextFilters
  );
  const exportQuery = useExportQuery(queryConfig, columns, contextFilters);

  const { data, aggregateData, isLoading, error, refetch } = useQuery<T>({
    // don't fire first query until localstorage is loaded
    query: isQueryConfigLocalStorageLoaded ? query : null,
    typename: queryConfig.tableName,
    hasAggregates: true,
  });

  if (error) {
    console.error(error);
  }

  const activeFilterCount = useActiveSwitchFilterCount(queryConfig);

  const rows = data || [];

  /**
   * Load queryConfig settings from localstorage
   */
  useEffect(() => {
    /**
     * Try to load queryConfig
     */
    const configFromStorageString = localStorage.getItem(localStorageKey) || "";
    let queryConfigFromStorage: QueryConfig | undefined;

    try {
      queryConfigFromStorage = JSON.parse(configFromStorageString);
    } catch {
      console.error(
        "Unable to parse queryConfig from local storage. Using default config instead"
      );
      setIsQueryConfigLocalStorageLoaded(true);
      return;
    }
    /**
     * Validate the query config we found in local storage
     */
    try {
      QueryConfigSchema.parse(queryConfigFromStorage);
    } catch (err) {
      console.error(
        "Invalid QueryConfig found in local storage. Using default config instead."
      );
      console.error(err);
      setIsQueryConfigLocalStorageLoaded(true);
      return;
    }
    /**
     * If date mode filters (YTD, 1Y, 5Y, etc) are in use, bring them into sync
     * with current date. We do this by recalculating the date filter start / end
     * dates and updating them in the config loaded from storage
     */
    if (
      queryConfigFromStorage?.dateFilter &&
      queryConfigFromStorage.dateFilter.mode !== "custom"
    ) {
      const { mode, column } = queryConfigFromStorage.dateFilter;

      const newDateFilter = makeDateFilterFromMode(
        mode,
        queryConfigFromStorage,
        column
      );

      queryConfigFromStorage.dateFilter = newDateFilter;
    }

    setIsQueryConfigLocalStorageLoaded(true);
    if (queryConfigFromStorage) {
      setQueryConfig(queryConfigFromStorage);
    }
  }, [localStorageKey]);

  /**
   * Load column visibility settings from localstorage
   */
  useEffect(() => {
    if (isColVisibilityLocalStorageLoaded) {
      return;
    }
    /**
     * Try to load column visibility
     */
    const columnLocalStorageKey = localStorageKey + "_columnVisibility";
    const columnVisibilityFromStorageString =
      localStorage.getItem(columnLocalStorageKey) || "";
    let columnVisibilityFromStorage: ColumnVisibilitySetting[] | undefined;

    try {
      columnVisibilityFromStorage = JSON.parse(
        columnVisibilityFromStorageString
      );
    } catch {
      console.error(
        "Unable to parse column visibility from local storage. Using default visibility instead"
      );
      setIsColVisibilityLocalStorageLoaded(true);
      return;
    }

    if (columnVisibilityFromStorage) {
      /**
       * Update the default visibility from what was found in local storage. This
       * ensures that stale col visibility data from storage is brought into sync
       * with the current version of the table config
       */
      const updatedColVisibilitySettings = columnVisibilitySettings.map(
        (col) => {
          const savedCol = columnVisibilityFromStorage.find(
            (savedCol) => savedCol.path === col.path
          );
          if (savedCol) {
            // use visibility from saved column
            return { ...col, isVisible: savedCol.isVisible };
          } else {
            return { ...col };
          }
        }
      );
      setColumnVisibilitySettings(updatedColVisibilitySettings);
      setIsColVisibilityLocalStorageLoaded(true);
    }
  }, [
    localStorageKey,
    columns,
    columnVisibilitySettings,
    isColVisibilityLocalStorageLoaded,
  ]);

  /**
   * Keep changes to query config in sync with localstorage
   */
  useEffect(() => {
    if (isQueryConfigLocalStorageLoaded) {
      localStorage.setItem(localStorageKey, JSON.stringify(queryConfig));
    }
  }, [isQueryConfigLocalStorageLoaded, queryConfig, localStorageKey]);

  /**
   * Keep changes to col visibility in sync with localstorage
   */
  useEffect(() => {
    if (isColVisibilityLocalStorageLoaded) {
      const columnVisLocalStorageKey = localStorageKey + "_columnVisibility";
      localStorage.setItem(
        columnVisLocalStorageKey,
        JSON.stringify(columnVisibilitySettings)
      );
    }
  }, [
    isColVisibilityLocalStorageLoaded,
    localStorageKey,
    columnVisibilitySettings,
  ]);

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
    const queryConfigMutable = cloneDeep(queryConfig);
    const initialQueryConfigMutable = cloneDeep(initialQueryConfig);
    /**
     * Ignore date timestamps if not using a custom range
     */
    if (
      queryConfig.dateFilter?.mode === initialQueryConfig.dateFilter?.mode &&
      queryConfigMutable.dateFilter &&
      queryConfig.dateFilter?.mode !== "custom"
    ) {
      /**
       * date modes are equal for our purposes - so remove the filter properties before
       * we pass the two configs through isEqual()
       */
      queryConfigMutable.dateFilter = undefined;
      initialQueryConfigMutable.dateFilter = undefined;
    }
    setAreFiltersDirty(!isEqual(queryConfigMutable, initialQueryConfigMutable));
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
  if (!isQueryConfigLocalStorageLoaded) {
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
              columnVisibilitySettings={columnVisibilitySettings}
              setColumnVisibilitySettings={setColumnVisibilitySettings}
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
          columns={columns}
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
