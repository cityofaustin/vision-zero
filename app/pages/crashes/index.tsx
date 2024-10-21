import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "@/utils/graphql";
import Table from "@/components/Table";
import AppBreadCrumb from "@/components/AppBreadCrumb";
import { crashesListViewColumns } from "@/configs/crashesListView";
import { CrashListCrash } from "@/types/types";
import { CRASHES_LIST_VIEW_QUERY } from "@/queries/crash";

export default function Crashes() {
  const {
    isLoading: isLoadingAuth,
    error: errorAuth,
    user,
    loginWithRedirect,
  } = useAuth0();

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
          {!isLoadingAuth && !errorAuth && !user && (
            <button onClick={() => loginWithRedirect()}>Log in</button>
          )}
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
