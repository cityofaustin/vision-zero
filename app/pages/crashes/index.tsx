import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Table from "@/components/Table";
import AppBreadCrumb from "@/components/AppBreadCrumb";
import { useQuery } from "@/utils/graphql";
import { crashesListViewColumns } from "@/configs/crashesListView";
import { CrashListCrash } from "@/types/types";
import { CRASHES_LIST_VIEW_QUERY } from "@/queries/crash";

export default function Crashes() {
  const { data } = useQuery<{
    crashes_list_view: CrashListCrash[];
  }>({
    query: CRASHES_LIST_VIEW_QUERY,
  });

  return (
    <>
      <AppBreadCrumb />
      <Row>
        <Col>
          <div>
            {data && (
              <Table
                rows={data.crashes_list_view}
                columns={crashesListViewColumns}
              />
            )}
          </div>
        </Col>
      </Row>
    </>
  );
}
