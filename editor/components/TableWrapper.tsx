import { useEffect, useMemo, useState } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Table from "@/components/Table";
import TableAdvancedSearchFilterToggle, {
  useActiveSwitchFilterCount,
} from "@/components/TableAdvancedSearchFilterToggle";
import TableDateSelector from "@/components/TableDateSelector";
import TableExportModal from "@/components/TableExportModal";
import TableMapToggle from "@/components/TableMapToggle";
import TableMapWrapper from "@/components/TableMapWrapper";
import TablePaginationControls from "@/components/TablePaginationControls";
import TableResetFiltersToggle from "@/components/TableResetFiltersToggle";
import TableSearch, { SearchSettings } from "@/components/TableSearch";
import TableSearchFieldSelector from "@/components/TableSearchFieldSelector";
import { useVisibleColumns } from "@/components/TableColumnVisibilityMenu";
import { QueryConfigSchema } from "@/schema/queryBuilder";
import { Filter, QueryConfig } from "@/types/queryBuilder";
import { ColDataCardDef } from "@/types/types";
import { makeDateFilterFromMode } from "@/utils/dates";
import { useQuery } from "@/utils/graphql";
import { useExportQuery, useQueryBuilder } from "@/utils/queryBuilder";
import cloneDeep from "lodash/cloneDeep";
import isEqual from "lodash/isEqual";

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
  const [areFiltersDirty, setAreFiltersDirty] = useState(false);
  const [isQueryConfigLocalStorageLoaded, setIsQueryConfigLocalStorageLoaded] =
    useState(false);
  const [
    isColVisibilityLocalStorageLoaded,
    setIsColVisibilityLocalStorageLoaded,
  ] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const [searchSettings, setSearchSettings] = useState<SearchSettings>({
    searchString: String(initialQueryConfig.searchFilter.value),
    searchColumn: initialQueryConfig.searchFilter.column,
  });
  const [queryConfig, setQueryConfig] = useState<QueryConfig>({
    ...initialQueryConfig,
  });

  /** Use custom hook to get array of visible columns, column visibility settings,
   * and state setter function */
  const {
    visibleColumns,
    columnVisibilitySettings,
    setColumnVisibilitySettings,
  } = useVisibleColumns(columns);

  /**
   * Array of columns which should be fetched - this is
   * is the combination of visible columns + fetchAlways columns
   */
  const allColumnsToFetch = useMemo(
    () =>
      columns.filter((col) => {
        const colFromVisibleColumns = visibleColumns.find(
          (visibleColumn) => visibleColumn.path === col.path
        );
        if (colFromVisibleColumns) {
          return true;
        } else if (col.fetchAlways) {
          return true;
        } else {
          return false;
        }
      }),
    [columns, visibleColumns]
  );

  const query = useQueryBuilder(
    queryConfig,
    allColumnsToFetch,
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
      console.warn(
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
   * Keep changes to query config in sync with localstorage
   */
  useEffect(() => {
    if (isQueryConfigLocalStorageLoaded) {
      localStorage.setItem(localStorageKey, JSON.stringify(queryConfig));
    }
  }, [isQueryConfigLocalStorageLoaded, queryConfig, localStorageKey]);

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
    /**
     * Ignore map toggle state by setting the same value in both configs
     *  - we don't want the filters dirty when switching between map/list mode
     */
    if (queryConfigMutable.mapConfig && initialQueryConfigMutable.mapConfig) {
      queryConfigMutable.mapConfig.isActive = true;
      initialQueryConfigMutable.mapConfig.isActive = true;
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
        <Col xs={12} md={4} className="d-flex justify-content-start mt-2">
          {queryConfig.filterCards?.length > 0 && (
            <TableAdvancedSearchFilterToggle
              activeFilterCount={activeFilterCount}
              queryConfig={queryConfig}
              setQueryConfig={setQueryConfig}
            />
          )}
          <TableSearch
            queryConfig={queryConfig}
            setQueryConfig={setQueryConfig}
            searchSettings={searchSettings}
            setSearchSettings={setSearchSettings}
          />
        </Col>
        {queryConfig.mapConfig && (
          <Col className="px-0 mt-2 me-2" xs="auto">
            <TableMapToggle
              queryConfig={queryConfig}
              setQueryConfig={setQueryConfig}
            />
          </Col>
        )}
        {areFiltersDirty && (
          <Col className="px-0 mt-2" xs="auto">
            <TableResetFiltersToggle
              isMapActive={queryConfig?.mapConfig?.isActive || false}
              initialQueryConfig={initialQueryConfig}
              setQueryConfig={setQueryConfig}
            />
          </Col>
        )}
        <Col className="d-flex justify-content-end mt-2">
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
            localStorageKey={localStorageKey}
            isColVisibilityLocalStorageLoaded={
              isColVisibilityLocalStorageLoaded
            }
            setIsColVisibilityLocalStorageLoaded={
              setIsColVisibilityLocalStorageLoaded
            }
          />
        </Col>
      </Row>
      {/* The actual table itself */}
      {(!queryConfig.mapConfig || !queryConfig.mapConfig.isActive) && (
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
      )}
      {queryConfig.mapConfig && queryConfig.mapConfig.isActive && (
        <TableMapWrapper mapConfig={queryConfig.mapConfig} data={rows} />
      )}
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
