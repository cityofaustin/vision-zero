import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@apollo/react-hooks";

import { withApollo } from "react-apollo";
import { CSVLink } from "react-csv";

import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Table,
  ButtonGroup,
  Spinner,
} from "reactstrap";

import GridTableHeader from "./GridTableHeader";
import GridTablePagination from "./GridTablePagination";
import GridTableSearch from "./GridTableSearch";
import GridFilters from "./GridFilters";
import GridDateRange from "./GridDateRange";
import ButtonToolbar from "reactstrap/es/ButtonToolbar";
import TableDateRange from "./TableDateRange";

const GridTable = ({ title, query, filters }) => {
  /**
   * State management:
   *      limit {int} - Contains the current limit of results in a page
   *      offset {int} - Contains the current offset for querying in the database
   *      page {int} - Contains the current page number (1 by default)
   *      sortColumn {string} - Contains the name of the column being used to sort the data
   *      sortOrder {string} - Contains either 'asc' or 'desc'
   *      searchParameters {object} - Contains the parameters for the text search
   *      collapseAdvancedFilters {bool} - Contains the filters section status (hidden, display)
   *      filterOptions {object} - Contains a list of filters and each individual status (enabled, disabled)
   *      dateRangeFilter {object} - Contains the date range (startDate, and endDate)
   */
  const [limit, setLimit] = useState(25);
  const [offset, setOffset] = useState(0);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [searchParameters, setSearchParameters] = useState({});
  const [collapseAdvancedFilters, setCollapseAdvacedFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState({});
  const [dateRangeFilter, setDateRangeFilter] = useState({});

  /**
   * Shows or hides advanced filters
   */
  const toggleAdvancedFilters = () => {
    setCollapseAdvacedFilters(!collapseAdvancedFilters);
  };

  /**
   * Handles the header click for sorting asc/desc.
   * @param {string} col - The name of the column
   **/
  const handleTableHeaderClick = col => {
    if (sortOrder === "" && sortColumn === "") {
      // First time sort is applied
      setSortOrder("asc");
      setSortColumn(col);
    } else if (sortColumn === col) {
      // Repeat sort on column
      sortOrder === "desc" ? setSortOrder("asc") : setSortOrder("desc");
    } else if (sortColumn !== col) {
      // Sort different column after initial sort
      setSortOrder("desc");
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
  };

  /**
   * Clears all filters
   */
  const clearFilters = () => {
    setSearchParameters({});
    setFilterOptions({});
  };

  /**
   *
   * Query Management
   *
   **/

  // Handle Date Range (only if available)
  if(dateRangeFilter['startDate'] && dateRangeFilter['endDate']) {
    query.setWhere("crash_date", `_gte: \"${dateRangeFilter['startDate']}\", _lte: \"${dateRangeFilter['endDate']}\"`);
  }

  // First initialize the filters
  query.loadFilters(filters, filterOptions);

  // Manage the WHERE clause of our query
  if (searchParameters["column"] && searchParameters["value"]) {
    // We will need to be careful which operator we will be using depending
    // on whether the column is an integer or a string, etc.
    if (searchParameters["column"] === "crash_id") {
      // Search Integer for exact value
      query.setWhere(
        searchParameters["column"],
        `_eq: ${searchParameters["value"]}`
      );
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

  // Mange LIMIT & OFFSET
  query.limit = limit;
  query.offset = offset;

  // Show us the current state of the query in the console!
  console.log(query.query);


  /**
   *
   * Render
   *
   **/

  // Make Query && Error handling
  let { loading, error, data } = useQuery(query.gql);
  if (error) return `Error! ${error.message}`;

  let dataEntries = [];
  let totalRecords = 0;
  let totalPages = 1;

  // If we have data
  if (data[query.table]) {
    loading = false;
    totalRecords = data[query.table + "_aggregate"]["aggregate"]["count"];
    totalPages = Math.ceil(totalRecords / limit);

    // DataEntries: For each item in the data array, generate a row with each column
    data[query.table].map((row, index) =>
      dataEntries.push(
        <tr key={index}>
          {query.columns.map(column => (
            <td>
              {query.isPK(column) ? (
                <Link to={`/${query.singleItem}/${row[column]}`}>
                  {row[column]}
                </Link>
              ) : (
                row[column]
              )}
            </td>
          ))}
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
              <Row>
                <GridTableSearch
                  query={query}
                  clearFilters={clearFilters}
                  setSearchParameters={setSearchParameters}
                  resetPage={resetPageOnSearch}
                  filters={filters}
                  toggleAdvancedFilters={toggleAdvancedFilters}
                />
                <GridFilters
                  isCollapsed={collapseAdvancedFilters}
                  filters={filters}
                  filterOptionsState={filterOptions}
                  setFilterOptions={setFilterOptions}
                />
              </Row>
              <ButtonToolbar className="mb-3 justify-content-between">
                <ButtonGroup>
                  <GridDateRange setDateRangeFilter={setDateRangeFilter} />
                </ButtonGroup>

                <ButtonGroup className="mb-2 float-right">
                  <GridTablePagination
                    moveNext={moveNextPage}
                    moveBack={moveBackPage}
                    pageNumber={page}
                    limit={limit}
                    totalRecords={totalRecords}
                    totalPages={totalPages}
                    handleRowClick={handleRowClick}
                  />
                  {data[query.table] && (
                    <CSVLink
                      className=""
                      data={data[query.table]}
                      filename={query.table + Date.now()}
                    >
                      <i className="fa fa-save fa-2x ml-2 mt-1" />
                    </CSVLink>
                  )}
                </ButtonGroup>
              </ButtonToolbar>
              <Table responsive>
                <GridTableHeader
                  query={query}
                  handleTableHeaderClick={handleTableHeaderClick}
                  sortColumn={sortColumn}
                  sortOrder={sortOrder}
                />

                <tbody>
                  {loading ? (
                    <Spinner className="mt-2" color="primary" />
                  ) : (
                    data && dataEntries
                  )}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default withApollo(GridTable);
