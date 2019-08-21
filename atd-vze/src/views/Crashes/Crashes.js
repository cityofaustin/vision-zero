import React, { useState, useEffect } from "react";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Table,
  Button,
  ButtonToolbar,
  ButtonGroup,
} from "reactstrap";
import { Link } from "react-router-dom";

import { useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import { withApollo } from "react-apollo";
import TableSearchBar from "../../Components/TableSearchBar";
import TableSortHeader from "../../Components/TableSortHeader";
import crashDataMap from "./crashDataMap";

const GET_CRASHES = gql`
  {
    atd_txdot_crashes(
      limit: 100
      where: { crash_fatal_fl: { _eq: "Y" } }
      order_by: { crash_date: desc }
    ) {
      crash_id
      death_cnt
      tot_injry_cnt
      crash_fatal_fl
      rpt_street_pfx
      rpt_street_sfx
      rpt_street_name
      crash_date
    }
  }
`;

const SORT_CRASHES = `
  {
    atd_txdot_crashes(
      limit: 100
      where: { crash_fatal_fl: { _eq: "Y" } }
      ORDER_BY
      ) {
        crash_id
        death_cnt
        tot_injry_cnt
        crash_fatal_fl
        rpt_street_pfx
        rpt_street_sfx
        rpt_street_name
        crash_date
      }
    }
  `;

// TODO decide what fields to search? dropdown with column names? Search all?
const SEARCH_CRASHES = `
  query {
    atd_txdot_crashes(
      limit: 100
      FILTER
      order_by: { crash_date: desc }
    ) {
      crash_id
      death_cnt
      tot_injry_cnt
      crash_fatal_fl
      rpt_street_pfx
      rpt_street_sfx
      rpt_street_name
      crash_date
    }
  }
`;

const PAGE_CRASHES = `
  {
    atd_txdot_crashes(
      LIMIT
      OFFSET
      where: { crash_fatal_fl: { _eq: "Y" } }
      order_by: { crash_date: desc }
    ) {
      crash_id
      death_cnt
      tot_injry_cnt
      crash_fatal_fl
      rpt_street_pfx
      rpt_street_sfx
      rpt_street_name
      crash_date
    }
  }
`;

const columns = [
  "crash_id",
  "crash_date",
  "rpt_street_name",
  "tot_injry_cnt",
  "death_cnt",
];

function Crashes() {
  const [tableData, setTableData] = useState("");
  const [hasSearchResults, setHasSearchResults] = useState(false);
  const [hasSortOrder, setHasSortOrder] = useState(false);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(100);
  const { loading, error, data } = useQuery(GET_CRASHES, {
    onCompleted:
      !hasSearchResults && !hasSortOrder && (data => setTableData(data)),
  });

  const pageQuery = () => {
    let queryWithPage = PAGE_CRASHES.replace("LIMIT", `limit: ${limit}`);
    queryWithPage = queryWithPage.replace("OFFSET", `offset: ${offset}`);
    return gql`
      ${queryWithPage}
    `;
  };

  const { loading: pageLoading, error: pageError, data: pageData } = useQuery(
    pageQuery()
  );

  const updatePageCrashTableData = () => {
    setTableData(pageData);
  };

  useEffect(() => {
    tableData !== "" && updatePageCrashTableData(pageData);
  }, [pageData]);

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  const updateSearchCrashTableData = (data, hasSearchResults) => {
    setHasSearchResults(hasSearchResults);
    setTableData(data);
    // Use Search Clear button to clear sort order as well/show unfiltered query data
    setHasSortOrder(false);
  };

  const updateSortCrashTableData = (data, hasSortOrder) => {
    setHasSortOrder(hasSortOrder);
    setTableData(data);
  };

  const updatePage = e => {
    const pageOption = e.target.innerText;
    if (offset !== 0 && pageOption === "Prev") {
      const decreasedOffset = offset - limit;
      setOffset(decreasedOffset);
    }
    if (offset === 0 && pageOption === "Prev") {
      return null;
    }
    if (pageOption === "Next") {
      const increasedOffset = offset + limit;
      setOffset(increasedOffset);
    }
  };

  return (
    <div className="animated fadeIn">
      <Row>
        <Col>
          <Card>
            <CardHeader>
              <i className="fa fa-car" /> Crashes
            </CardHeader>
            <CardBody>
              <TableSearchBar
                queryString={SEARCH_CRASHES}
                updateResults={updateSearchCrashTableData}
                hasSearchResults={setHasSearchResults}
              />
              <ButtonToolbar className="justify-content-between">
                <ButtonGroup>
                  <Button onClick={updatePage}>Prev</Button>
                </ButtonGroup>
                <ButtonGroup>
                  <Button onClick={updatePage}>Next</Button>
                </ButtonGroup>
              </ButtonToolbar>
              <Table responsive>
                <TableSortHeader
                  queryString={SORT_CRASHES}
                  columns={columns}
                  updateTableData={updateSortCrashTableData}
                  fieldMap={crashDataMap}
                  hasSortOrder={hasSortOrder}
                />
                <tbody>
                  {tableData &&
                    tableData.atd_txdot_crashes.map(crash => (
                      <tr key={crash.crash_id}>
                        <td>
                          <Link to={`crashes/${crash.crash_id}`}>
                            {crash.crash_id}
                          </Link>
                        </td>
                        <td>{crash.crash_date}</td>
                        <td>{`${crash.rpt_street_pfx} ${
                          crash.rpt_street_name
                        } ${crash.rpt_street_sfx}`}</td>
                        <td>
                          <Badge color="warning">{crash.tot_injry_cnt}</Badge>
                        </td>
                        <td>
                          <Badge color="danger">{crash.death_cnt}</Badge>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default withApollo(Crashes);
