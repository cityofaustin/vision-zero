import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useLazyQuery } from "@apollo/react-hooks";

import { withApollo } from "react-apollo";
import { format, subYears } from "date-fns";

import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Table,
  ButtonGroup,
  Spinner,
} from "reactstrap";

// React Strap
import ButtonToolbar from "reactstrap/es/ButtonToolbar";

// GridTable
import GridTableHeader from "./GridTableHeader";
import GridTableWidgets from "./GridTableWidgets";
import GridTablePagination from "./GridTablePagination";
import GridTableSearch from "./GridTableSearch";
import GridFilters from "./GridFilters";
import GridDateRange from "./GridDateRange";
import GridExportData from "./GridExportData";
import GridTableDoughnut from "./GridTableDoughnut";
import GridTableHorizontalBar from "./GridTableHorizontalBar";
import GridTableFilterBadges from "./GridTableFilterBadges";
import { appCodeName } from "../helpers/environment";


const GridTable = ({
  title,
  query,
  filters,
  columnsToExport,
  aggregateQueryConfig,
  chartConfig,
  widgetsConfig,
  helperText,
  minDate,
  roleSpecificColumns,
  hasSpecificRole,
  defaultSearchField,
}) => {
  // Load table filters from localStorage by title
  const savedFilterState = JSON.parse(
    localStorage.getItem(`${appCodeName}_saved_${title}_config`)
  );

  // Return saved filters if they exist
  const getSavedState = stateName =>
    (savedFilterState && savedFilterState[`${stateName}`]) || false;

  const defaultTimeRange = {
    startDate: format(subYears(new Date(), 1), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
  };

  /**
   * State management:
   *      limit {int} - Contains the current limit of results in a page
   *      offset {int} - Contains the current offset for querying in the database
   *      page {int} - Contains the current page number (1 by default)
   *      sortColumn {string} - Contains the name of the column being used to sort the data
   *      sortOrder {string} - Contains either 'asc' or 'desc'
   *      searchParameters {object} - Contains the parameters for the text search
   *      isAdvancedSearchMenuOpen {bool} - Contains the filters section status (hidden, display)
   *      filterOptions {object} - Contains a list of filters and each individual status (enabled, disabled)
   *      dateRangeFilter {object} - Contains the date range (startDate, and endDate)
   */

  // Use saved filter as default if it exists
  const [limit, setLimit] = useState(getSavedState("limit") || 25);
  const [offset, setOffset] = useState(getSavedState("offset") || 0);
  const [page, setPage] = useState(getSavedState("page") || 1);
  const [sortColumn, setSortColumn] = useState(
    getSavedState("sortColumn") || ""
  );
  const [sortOrder, setSortOrder] = useState(getSavedState("sortOrder") || "");
  const [searchParameters, setSearchParameters] = useState(
    getSavedState("searchParameters") || {}
  );
  const [isAdvancedSearchMenuOpen, setIsAdvancedSearchMenuOpen] = useState(
    getSavedState("isAdvancedSearchMenuOpen") || false
  );
  const [filterOptions, setFilterOptions] = useState(
    getSavedState("filterOptions") || {}
  );
  const [dateRangeFilter, setDateRangeFilter] = useState(
    getSavedState("dateRangeFilter") || defaultTimeRange
  );

  // Save query config by title to localStorage each time component renders
  useEffect(() => {
    const stateForFilters = {
      limit,
      offset,
      page,
      sortColumn,
      sortOrder,
      searchParameters,
      isAdvancedSearchMenuOpen,
      filterOptions,
      dateRangeFilter,
    };
    localStorage.setItem(
      `${appCodeName}_saved_${title}_config`,
      JSON.stringify(stateForFilters)
    );
  });

  // Aggregate and chart query state and queries
  const [aggregateQuery, setAggregateQuery] = useState(null);
  const [loadAggData, { data: aggData }] = useLazyQuery(aggregateQuery);
  const [chartQuery, setChartQuery] = useState(null);
  const [loadChartData, { data: chartData }] = useLazyQuery(chartQuery);

  // Update aggregate and chart queries with latest filters
  //  Use `[query.gql]` for dependency list because we need to depend on changes
  //  in the query instance to propogate changes to children. This does not work
  //  properly so changes in the aggregateQuery and chartQuery are compared in
  //  if blocks.
  useEffect(() => {
    if (aggregateQueryConfig) {
      const updatedAggregateQuery = query.queryAggregate(
        aggregateQueryConfig,
        query
      );
      // If previous query is different from updated query,
      // set query to propogate change to children (and prevent endless loop)
      if (updatedAggregateQuery !== aggregateQuery) {
        setAggregateQuery(updatedAggregateQuery);
      }
    }

    if (chartConfig) {
      delete query.config.limit;
      const updatedChartsQuery = query.gql;
      // If previous query is different from updated query,
      // set query to propogate change to children (and prevent endless loop)
      if (updatedChartsQuery !== chartQuery) {
        setChartQuery(updatedChartsQuery);
      }
    }
  }, [query.gql]); // eslint-disable-line react-hooks/exhaustive-deps

  // Execute aggregate query each time query filters change
  useEffect(() => {
    aggregateQuery !== null && loadAggData();
  }, [aggregateQuery, loadAggData]);

  // Execute chart query each time query filters change
  useEffect(() => {
    chartQuery !== null && loadChartData();
  }, [chartQuery, loadChartData]);

  /**
   * Shows or hides advanced filters
   */
  const toggleAdvancedFilters = () => {
    setIsAdvancedSearchMenuOpen(!isAdvancedSearchMenuOpen);
  };

  /**
   * Handles the header click for sorting asc/desc.
   * @param {string} col - The name of the column
   **/
  const handleTableHeaderClick = col => {
    // Before anything, let's clear all current conditions
    query.clearOrderBy();

    // If both column and order are empty...
    if (sortOrder === "" && sortColumn === "") {
      // First time sort is applied
      setSortOrder("asc");
      setSortColumn(col);
    } else if (sortColumn === col) {
      // Else if the current sortColumn is the same as the new
      // then invert values and repeat sort on column
      sortOrder === "desc_nulls_last"
        ? setSortOrder("asc")
        : setSortOrder("desc_nulls_last");
    } else if (sortColumn !== col) {
      // Sort different column after initial sort, then reset
      setSortOrder("desc_nulls_last");
      setSortColumn(col);
    }
  };

  /**
   * Changes the state of the current page, and offset limit.
   * @param {integer} n - the page we need to change it to
   */
  const changePage = n => {
    setPage(n);
    setOffset(n * limit - limit);
  };

  /**
   * Moves to the next page of results, by changing the state to current page plus one.
   */
  const moveNextPage = () => {
    changePage(page + 1);
  };

  /**
   * Moves to the previous page of results, by substracting 1 to the current page.
   */
  const moveBackPage = () => {
    changePage(page - 1);
  };

  /**
   * Resets the page number whenever it starts a new search
   */
  const resetPageOnSearch = () => {
    changePage(1);
  };

  /**
   * Handles a click on the limit dropdown menu.
   * @param {object} e - the event parameter
   */
  const handleRowClick = e => {
    const rowNumber = parseInt(e.target.value);
    setLimit(rowNumber);
    changePage(1);
  };

  /**
   * Clears all filters
   */
  const clearFilters = () => {
    query.resetOrderBy();
    query.deleteWhere(searchParameters.column);
    setSearchParameters({});
    setFilterOptions({});
    resetPageOnSearch();
    setDateRangeFilter(defaultTimeRange);
    setLimit(25);
  };

  /**
   * Returns true if the input string is a valid alphanumeric object key
   * @param {string} input - The string to be tested
   * @returns {boolean}
   */
  const isAlphanumeric = input => input.match(/^[0-9a-zA-Z\-_]+$/) !== null;

  /**
   * Extracts a list of keys in a graphql expression
   * @param {string} exp - The expression
   * @returns {Array}
   */
  const listKeys = exp =>
    exp.split(/[{} ]+/).filter(n => isAlphanumeric(n) && n !== "");

  /**
   * Returns the value of a data structure based on the list of keys provided
   * @param {object} obj - the object in question
   * @param {Array} keys - the list of keys
   * @returns {*}
   */
  const responseValue = (obj, keys) => {
    for (let k = 1; k < keys.length; k++) {
      try {
        obj = obj[keys[k]];
      } catch {
        obj = null;
      }
    }
    return obj;
  };

  /**
   * Extracts the value (or summary of values) for nested field names
   * @param {object} obj - The dataset current object
   * @param {string} exp - The graphql expression
   * @returns {string}
   */
  const getSummary = (obj, exp) => {
    let result = [];
    let map = new Map();
    let keys = listKeys(exp);

    // First we need to get to the specific section of the object we need
    let section = obj[keys[0]];

    // If not an array, resolve its value
    if (!Array.isArray(section)) {
      // Return direct value
      return responseValue(section, keys);
    }

    // If it is an array, resolve each and aggregate
    for (let item of section) {
      let val = responseValue(item, keys);

      if (val !== null) {
        map.set(val, true);
        result.push(val);
      }
    }
    // Merge all into a string
    return result.join(", ");
  };

  /**
   *
   * Query Management
   *
   **/

  // Allow for Date Range to be configured from the queryConf/gqlAbstract query props
  const hasDateRange =
    typeof query.config.showDateRange !== "undefined"
      ? query.config.showDateRange
      : true;

  const dateField = query.config.dateField;

  // Handle Date Range (only if available)
  if (
    hasDateRange &&
    dateRangeFilter["startDate"] &&
    dateRangeFilter["endDate"]
  ) {
    query.setWhere(
      dateField,
      `_gte: "${dateRangeFilter["startDate"]}", _lte: "${
        dateRangeFilter["endDate"]
      }"`
    );
  }

  // First initialize the filters
  query.loadFilters(filters, filterOptions);

  // Manage the WHERE clause of our query
  if (searchParameters["column"] && searchParameters["value"]) {
    // We will need to be careful which operator we will be using depending
    // on whether the column is an integer or a string, etc.

    // Create an array of the searchable filters so we can loop over them and delete
    // any old search parameters from the 'where' query before adding new search parameters.
    const searchableColumns = Object.keys(query.config.columns).filter(
      column => query.config.columns[column].searchable
    );

    searchableColumns.forEach(column => {
      query.deleteWhere(column);
    });

    const useEqSearch = ["cris_crash_id", "form_id", "record_id"].includes(
      searchParameters["column"]
    );

    if (useEqSearch) {
      // Search Integer for exact value
      // If string contains integers, insert in gql query, if not insert 0 to return no matches
      const parsedValue = parseInt(searchParameters["value"]);
      const value = isNaN(parsedValue) ? 0 : parsedValue;
      query.setWhere(searchParameters["column"], `_eq: ${value}`);
    } else {
      // Search Case-Insensitive String
      query.setWhere(
        searchParameters["column"],
        `_ilike: "%${searchParameters["value"]}%"`
      );
    }
  }

  // Manage the ORDER BY clause of our query
  if (sortColumn !== "" && sortOrder !== "") {
    query.setOrder(sortColumn, sortOrder);
  }

  // Manage LIMIT & OFFSET
  query.limit = limit;
  query.offset = offset;

  // Show us the current state of the query in the console!
  // console.log(query.query);

  /**
   *
   * Render
   *
   **/
  // Make Query && Error handling
  let { loading, error, data } = useQuery(query.gql, query.useQueryOptions);

  if (error) return `Error! ${error.message}`;

  let dataEntries = [];

  // If we have data
  if (data[query.table]) {
    // DataEntries: For each item in the data array, generate a row with each column
    data[query.table].map((row, index) =>
      dataEntries.push(
        <tr key={index}>
          {query.columns.map(
            (column, ci) =>
              // If column is hidden, don't render <td>
              !query.isHidden(column) && (
                <td key={ci}>
                  {query.isPK(column) ? (
                    <Link to={`/${query.singleItem}/${row[column]}`}>
                      {row[column]}
                    </Link>
                  ) : isAlphanumeric(column) ? (
                    query.getFormattedValue(column, row[column])
                  ) : (
                    query.getFormattedValue(
                      column,
                      getSummary(row, column.trim())
                    )
                  )}
                </td>
              )
          )}
        </tr>
      )
    );
  }

  return (
    <div className="animated fadeIn">
      <Row>
        <Col>
          <Card>
            <CardHeader>
              <i className="fa fa-car" /> {title}
            </CardHeader>
            <CardBody>
              {filters && !isAdvancedSearchMenuOpen && (
                <GridTableFilterBadges
                  searchParams={searchParameters}
                  advancedFilterParams={filterOptions}
                  advancedFiltersConfig={filters}
                />
              )}
              <Row>
                {!!aggData &&
                  !!chartData &&
                  chartConfig.map((chart, i) => {
                    if (chart.type === "horizontal") {
                      return (
                        <Col key={i} md="6">
                          <GridTableHorizontalBar
                            chartData={chartData}
                            chartConfig={chart}
                          />
                        </Col>
                      );
                    } else if (chart.type === "doughnut") {
                      return (
                        <Col key={i} md="6">
                          <GridTableDoughnut
                            chartData={chartData}
                            chartConfig={chart}
                          />
                        </Col>
                      );
                    } else {
                      return null;
                    }
                  })}
              </Row>
              {aggregateQueryConfig && widgetsConfig && (
                <Row>
                  <GridTableWidgets
                    aggData={aggData}
                    widgetsConfig={widgetsConfig}
                  />
                </Row>
              )}
              <Row>
                <GridTableSearch
                  query={query}
                  clearFilters={clearFilters}
                  searchParameters={searchParameters}
                  setSearchParameters={setSearchParameters}
                  resetPage={resetPageOnSearch}
                  filters={filters}
                  toggleAdvancedFilters={toggleAdvancedFilters}
                  defaultSearchField={defaultSearchField}
                />
                <GridFilters
                  isOpen={isAdvancedSearchMenuOpen}
                  filters={filters}
                  filterOptionsState={filterOptions}
                  setFilterOptions={setFilterOptions}
                  resetPageOnSearch={resetPageOnSearch}
                />
              </Row>
              <ButtonToolbar className="mb-3 justify-content-between">
                <div>
                  {hasDateRange && (
                    <ButtonGroup className="mr-5">
                      <GridDateRange
                        setDateRangeFilter={setDateRangeFilter}
                        initStartDate={dateRangeFilter.startDate}
                        initEndDate={dateRangeFilter.endDate}
                        minDate={minDate}
                      />
                    </ButtonGroup>
                  )}
                  {loading && (
                    <ButtonGroup>
                      <Spinner color="primary" />
                    </ButtonGroup>
                  )}
                </div>
                <ButtonGroup className="mb-2 float-right">
                  <GridTablePagination
                    moveNext={moveNextPage}
                    moveBack={moveBackPage}
                    pageNumber={page}
                    limit={limit}
                    handleRowClick={handleRowClick}
                    recordsCount={dataEntries.length}
                  />
                  {columnsToExport && (
                    <GridExportData
                      query={query}
                      columnsToExport={columnsToExport}
                      roleSpecificColumns={roleSpecificColumns}
                      hasSpecificRole={hasSpecificRole}
                    />
                  )}
                </ButtonGroup>
              </ButtonToolbar>

              <Table responsive>
                <GridTableHeader
                  query={query}
                  handleTableHeaderClick={handleTableHeaderClick}
                  sortColumn={sortColumn}
                  sortOrder={sortOrder}
                  helperText={helperText}
                />
                <tbody>{data && dataEntries}</tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default withApollo(GridTable);
