import { useState } from "react";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";
import Table from "@/components/Table";
import AppBreadCrumb from "@/components/AppBreadCrumb";
import TableSearch from "@/components/TableSearch";
import TableDateSelector, {
  getYtdDateRange,
  makeDateFilters,
} from "@/components/TableDateSelector";
import TableSearchFieldSelector from "@/components/TableSearchFieldSelector";
import { useQuery } from "@/utils/graphql";
import { crashesListViewColumns } from "@/configs/crashesListView";
import { CrashListCrash } from "@/types/types";
import { useQueryBuilder, QueryConfig } from "@/utils/queryBuilder";
import { DEFAULT_QUERY_LIMIT } from "@/utils/constants";

const LIST_VIEW_COLUMNS = crashesListViewColumns.map((col) => String(col.name));

const initialQueryConfig: QueryConfig = {
  columns: LIST_VIEW_COLUMNS,
  tableName: "crashes_list_view",
  limit: DEFAULT_QUERY_LIMIT,
  sortColName: "crash_timestamp",
  sortAsc: false,
  searchFilter: {
    id: "search",
    value: "",
    column: "record_locator",
    operator: "_ilike",
    wildcard: true,
  },
  dateFilter: {
    mode: "ytd",
    column: "crash_timestamp",
    filters: makeDateFilters("crash_timestamp", getYtdDateRange()),
  },
  filterGroups: [],
};

export default function Crashes() {
  const [queryConfig, setQueryConfig] =
    useState<QueryConfig>(initialQueryConfig);
  const query = useQueryBuilder(queryConfig);

  const { data, isLoading } = useQuery<{
    crashes_list_view: CrashListCrash[];
  }>({
    query,
  });

  return (
    <>
      <AppBreadCrumb />
      <Card className="mx-3 mb-3">
        <Card.Header className="fs-5 fw-bold">Crashes</Card.Header>
        <Card.Body>
          <form>
            <Row className="mt-3 mb-1">
              <Col xs={12} md={6}>
                <TableSearchFieldSelector
                  queryConfig={queryConfig}
                  setQueryConfig={setQueryConfig}
                />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col xs={12} md={5}>
                <TableSearch
                  queryConfig={queryConfig}
                  setQueryConfig={setQueryConfig}
                />
              </Col>
              <Col xs={12} md="auto" className="mt-sm-3 mt-md-0">
                <TableDateSelector
                  queryConfig={queryConfig}
                  setQueryConfig={setQueryConfig}
                />
              </Col>
              <Col xs={12} sm="auto">
                {isLoading && <Spinner variant="primary" />}
              </Col>
            </Row>
          </form>
          <Row>
            <Col>
              <Table
                rows={data?.crashes_list_view || []}
                columns={crashesListViewColumns}
                queryConfig={queryConfig}
                setQueryConfig={setQueryConfig}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
}
