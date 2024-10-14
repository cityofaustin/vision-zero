import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useAuth0 } from "@auth0/auth0-react";
import { useGraphQL } from "@/utils/graphql";
import Table from "@/components/Table";
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

  const { data } = useGraphQL<{
    crashes_list_view: CrashListCrash[];
  }>({
    query: CRASHES_LIST_VIEW_QUERY,
  });

  return (
    <Row>
      <Col>
        {!isLoadingAuth && !errorAuth && !user && (
          <button onClick={() => loginWithRedirect()}>Log in</button>
        )}
        <h2>Crashes</h2>

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
  );
}
