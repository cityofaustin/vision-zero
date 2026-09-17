import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
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
import ColumnVisibilityAlert from "@/components/ColumnVisibilityAlert";

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
  /**
   * If provided, enables logging a user event when filters menu is opened
   */
  filtersEventName?: string;
  /**
   * If provided, enables logging a user event when map view is activated
   */
  mapEventName?: string;
  /**
   * If provided, enables logging a user event when download modal is opened
   */
  downloadEventName?: string;
}

/**
 * Parse and validate a QueryConfig string from localStorage.
 * Returns initialQueryConfig when missing/invalid/outdated.
 */
function parseStoredQueryConfig(
  raw: string | null,
  initialQueryConfig: QueryConfig
): QueryConfig {
  if (!raw) {
    return initialQueryConfig;
  }

  let parsed: QueryConfig;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.warn(
      "Unable to parse queryConfig from local storage. Using default config instead"
    );
    return initialQueryConfig;
  }

  if (parsed?._version !== initialQueryConfig._version) {
    // New config version found — wipe out the cached version from local storage
    return initialQueryConfig;
  }

  try {
    QueryConfigSchema.strict().parse(parsed);
  } catch (err) {
    console.error(
      "Invalid QueryConfig found in local storage. Using default config instead."
    );
    console.error(err);
    return initialQueryConfig;
  }

  /**
   * If date mode filters (YTD, 1Y, 5Y, etc) are in use, bring them into sync
   * with current date. Recalculate without mutating the parsed object.
   */
  if (parsed.dateFilter && parsed.dateFilter.mode !== "custom") {
    const { mode, column } = parsed.dateFilter;
    return {
      ...parsed,
      dateFilter: makeDateFilterFromMode(mode, parsed, column),
    };
  }

  return parsed;
}

function areQueryConfigsDirty(
  queryConfig: QueryConfig,
  initialQueryConfig: QueryConfig
): boolean {
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
    queryConfigMutable.dateFilter = undefined;
    initialQueryConfigMutable.dateFilter = undefined;
  }
  /**
   * Ignore map toggle state — we don't want filters dirty when switching
   * between map/list mode
   */
  if (queryConfigMutable.mapConfig && initialQueryConfigMutable.mapConfig) {
    queryConfigMutable.mapConfig.isActive = true;
    initialQueryConfigMutable.mapConfig.isActive = true;
  }
  return !isEqual(queryConfigMutable, initialQueryConfigMutable);
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
  filtersEventName,
  mapEventName,
  downloadEventName,
}: TableProps<T>) {
  /**
   * Client gate only — do NOT also wait on column-visibility localStorage here.
   * TablePaginationControls must mount to load column visibility; blocking on
   * that flag prevents the query from ever firing (blank /crashes page).
   */
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const rawStoredConfig = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("storage", onStoreChange);
      return () => window.removeEventListener("storage", onStoreChange);
    },
    () => localStorage.getItem(localStorageKey),
    () => null
  );

  const configFromStorage = useMemo(
    () => parseStoredQueryConfig(rawStoredConfig, initialQueryConfig),
    [rawStoredConfig, initialQueryConfig]
  );

  const [queryConfigOverride, setQueryConfigOverride] =
    useState<QueryConfig | null>(null);
  const [prevLocalStorageKey, setPrevLocalStorageKey] =
    useState(localStorageKey);
  if (localStorageKey !== prevLocalStorageKey) {
    setPrevLocalStorageKey(localStorageKey);
    setQueryConfigOverride(null);
  }

  const queryConfig = queryConfigOverride ?? configFromStorage;
  const setQueryConfig: Dispatch<SetStateAction<QueryConfig>> = (action) => {
    setQueryConfigOverride((prev) => {
      const base = prev ?? configFromStorage;
      return typeof action === "function" ? action(base) : action;
    });
  };

  const [
    isColVisibilityLocalStorageLoaded,
    setIsColVisibilityLocalStorageLoaded,
  ] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  /**
   * Draft search input; cleared when queryConfig.searchFilter changes
   * (e.g. reset filters) so the input stays in sync without an effect.
   */
  const searchFilterKey = `${queryConfig.searchFilter.column}:${String(queryConfig.searchFilter.value)}`;
  const [searchDraft, setSearchDraft] = useState<SearchSettings | null>(null);
  const [prevSearchFilterKey, setPrevSearchFilterKey] =
    useState(searchFilterKey);
  if (searchFilterKey !== prevSearchFilterKey) {
    setPrevSearchFilterKey(searchFilterKey);
    setSearchDraft(null);
  }
  const searchSettings: SearchSettings = searchDraft ?? {
    searchString: String(queryConfig.searchFilter.value),
    searchColumn: queryConfig.searchFilter.column,
  };
  const setSearchSettings: Dispatch<SetStateAction<SearchSettings>> = (
    action
  ) => {
    setSearchDraft((prev) => {
      const base = prev ?? {
        searchString: String(queryConfig.searchFilter.value),
        searchColumn: queryConfig.searchFilter.column,
      };
      return typeof action === "function" ? action(base) : action;
    });
  };

  const areFiltersDirty = useMemo(
    () => areQueryConfigsDirty(queryConfig, initialQueryConfig),
    [queryConfig, initialQueryConfig]
  );

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
    // don't fire first query until client + column visibility are ready
    query:
      isClient &&
      isColVisibilityLocalStorageLoaded &&
      visibleColumns.length > 0
        ? query
        : null,
    typename: queryConfig.tableName,
    hasAggregates: true,
  });

  // Log errors in an effect to avoid setState during render
  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  const activeFilterCount = useActiveSwitchFilterCount(queryConfig);

  const rows = data || [];

  /**
   * Keep changes to query config in sync with localstorage (external store only)
   */
  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(localStorageKey, JSON.stringify(queryConfig));
  }, [isClient, queryConfig, localStorageKey]);

  /**
   * Hook to trigger refetch
   */
  useEffect(() => {
    refetch();
  }, [_refetch, refetch]);

  /**
   * Wait for client so filter UI uses localStorage on first paint
   * (avoids a flash of defaults). Column visibility still loads after mount
   * via TablePaginationControls — do not block render on that flag.
   */
  if (!isClient) {
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
              eventName={filtersEventName}
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
              eventName={mapEventName}
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
            <ColumnVisibilityAlert show={visibleColumns.length === 0} />
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
          eventName={downloadEventName}
        />
      )}
    </>
  );
}
