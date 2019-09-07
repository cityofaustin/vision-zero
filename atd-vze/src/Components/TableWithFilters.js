import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
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
  ButtonToolbar,
  ButtonGroup,
  Spinner,
} from "reactstrap";
import TableSearchBar from "./TableSearchBar";
import TableSortHeader from "./TableSortHeader";
import TablePaginationControl from "./TablePaginationControl";
import TableDateRange from "./TableDateRange";

const TableWithFilters = ({
  title,
  defaultQuery,
  filterQuery,
  fieldsToSearch,
  columns,
  dataKey,
  fieldMap,
  databaseDateColumnName,
}) => {
  const [tableQuery, setTableQuery] = useState(defaultQuery);
  // Filter states hold array of objects, [{ KEYWORD: `string that replaces keyword`}]
  const [pageFilter, setPageFilter] = useState("");
  const [orderFilter, setOrderFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState("");
  console.log(tableQuery);

  useEffect(() => {
    // On every render, filterQuery is copied, unset filters are removed, set filters replace keywords in filterQuery
    // Then, a GraphQL query is made from the string and response from DB populates table
    const removeFiltersNotSet = queryWithFilters => {
      let queryWithFiltersCleared = queryWithFilters;
      if (pageFilter === "") {
        queryWithFiltersCleared = queryWithFiltersCleared.replace("OFFSET", "");
        queryWithFiltersCleared = queryWithFiltersCleared.replace("LIMIT", "");
      }
      if (orderFilter === "") {
        queryWithFiltersCleared = queryWithFiltersCleared.replace(
          "ORDER_BY",
          ""
        );
      }
      if (searchFilter === "" && dateRangeFilter === "") {
        queryWithFiltersCleared = queryWithFiltersCleared.replace("SEARCH", "");
      }
      return queryWithFiltersCleared;
    };

    const createQuery = () => {
      let queryWithFilters = filterQuery;
      queryWithFilters = removeFiltersNotSet(queryWithFilters);
      if (pageFilter === "" && orderFilter === "") {
        setTableQuery(defaultQuery);
      } else {
        if (pageFilter !== "") {
          pageFilter.forEach(query => {
            queryWithFilters = queryWithFilters.replace(
              Object.keys(query),
              Object.values(query)
            );
          });
        }
        if (orderFilter !== "") {
          orderFilter.forEach(query => {
            queryWithFilters = queryWithFilters.replace(
              Object.keys(query),
              Object.values(query)
            );
          });
        }
        if (dateRangeFilter !== "" && searchFilter !== "") {
          // Combine both 'where' queries into one argument and replace in queryWithFilters
          const dateRangeQueryComponent = Object.values(
            dateRangeFilter[0]
          )[0].replace("where: {", ",");
          const searchQueryComponent = Object.values(searchFilter[0])[0].slice(
            0,
            -2
          );
          const combinedFilterString = searchQueryComponent.concat(
            dateRangeQueryComponent
          );
          dateRangeFilter.forEach(query => {
            queryWithFilters = queryWithFilters.replace(
              Object.keys(query),
              combinedFilterString
            );
          });
        }
        if (searchFilter !== "" && dateRangeFilter === "") {
          searchFilter.forEach(query => {
            queryWithFilters = queryWithFilters.replace(
              Object.keys(query),
              Object.values(query)
            );
          });
        }
        if (dateRangeFilter !== "" && searchFilter === "") {
          dateRangeFilter.forEach(query => {
            queryWithFilters = queryWithFilters.replace(
              Object.keys(query),
              Object.values(query)
            );
          });
        }
        setTableQuery(queryWithFilters);
      }
    };
    createQuery();
  }, [
    pageFilter,
    orderFilter,
    searchFilter,
    tableQuery,
    defaultQuery,
    filterQuery,
    dateRangeFilter,
  ]);

  const { loading, error, data } = useQuery(
    gql`
      ${tableQuery}
    `,
    { fetchPolicy: "no-cache" }
  );

  if (error) return `Error! ${error.message}`;

  const clearFilters = () => {
    setOrderFilter("");
    setSearchFilter("");
  };

  return (
    <div className="animated fadeIn">
      <Row>
        <Col>
          <Card>
            <CardHeader>
              <i className="fa fa-car" /> {title}
            </CardHeader>
            <CardBody>
              <TableSearchBar
                fieldsToSearch={fieldsToSearch}
                setSearchFilter={setSearchFilter}
                clearFilters={clearFilters}
              />
              <ButtonToolbar className="mb-3 justify-content-between">
                <ButtonGroup>
                  <TableDateRange
                    setDateRangeFilter={setDateRangeFilter}
                    databaseDateColumnName={databaseDateColumnName}
                  />
                </ButtonGroup>
                <ButtonGroup>
                  <TablePaginationControl
                    className="float-right"
                    responseDataSet={"atd_txdot_crashes"}
                    setPageFilter={setPageFilter}
                  />{" "}
                  {data[dataKey] && (
                    <CSVLink
                      className=""
                      data={data[dataKey]}
                      filename={dataKey + Date.now()}
                    >
                      <i className="fa fa-save fa-2x ml-2 mt-1" />
                    </CSVLink>
                  )}
                </ButtonGroup>
              </ButtonToolbar>
              <Table responsive>
                <TableSortHeader
                  columns={columns}
                  setOrderFilter={setOrderFilter}
                  fieldMap={fieldMap}
                />
                <tbody>
                  {loading ? (
                    <Spinner className="mt-2" color="primary" />
                  ) : (
                    data &&
                    data[dataKey].map(crash => (
                      <tr key={crash.crash_id}>
                        <td>
                          <Link to={`crashes/${crash.crash_id}`}>
                            {crash.crash_id}
                          </Link>
                        </td>
                        <td>{crash.crash_date}</td>
                        <td>{`${crash.rpt_street_pfx} ${crash.rpt_street_name} ${crash.rpt_street_sfx}`}</td>
                        <td>
                          <Badge color="warning">{crash.tot_injry_cnt}</Badge>
                        </td>
                        <td>
                          <Badge color="danger">{crash.death_cnt}</Badge>
                        </td>
                      </tr>
                    ))
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

export default withApollo(TableWithFilters);
