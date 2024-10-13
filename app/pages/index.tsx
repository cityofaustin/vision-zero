import { useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { gql } from "graphql-request";
import { useAuth0 } from "@auth0/auth0-react";
import { useGraphQL } from "@/components/client";

const QUERY = gql`
  query {
    crashes_list_view(limit: 100) {
      id
      cris_crash_id
      address_primary
    }
  }
`;

interface Crash {
  id: number;
  cris_crash_id: number | null;
  address_primary: string | null;
  address_secondary: string | null;
}

interface Crashes {
  crashes_list_view: Crash[];
}

export default function Home() {
  const {
    isLoading: isLoadingAuth,
    error: errorAuth,
    user,
    loginWithRedirect,
  } = useAuth0();

  const [collapsed, setCollapsed] = useState(false);
  const toggleSidebar = () => setCollapsed(!collapsed);
  const { data, error, isLoading } = useGraphQL<Crashes>({
    query: QUERY,
  });

  return (
    <Container fluid style={{ height: "100vh", overflow: "hidden" }}>
      {!isLoadingAuth && !errorAuth && !user && (
        <button onClick={() => loginWithRedirect()}>Log in</button>
      )}
      <Row className="h-100">
        {/* Sidebar */}
        <Col
          xs={collapsed ? "auto" : 2}
          className="bg-dark text-white p-0"
          style={{
            height: "100vh",
            overflowY: "auto",
          }}
        >
          <div className="d-flex flex-column h-100">
            <Button onClick={toggleSidebar} variant="dark">
              {collapsed ? ">" : "<"}
            </Button>
            {!collapsed && (
              <div className="p-3">
                <h5>Sidebar</h5>
                <p>Link</p>
                <p>Link</p>
                <p>Link</p>
              </div>
            )}
          </div>
        </Col>

        {/* Main content */}
        <Col
          style={{
            height: "100vh",
            overflowY: "auto",
          }}
        >
          <h2>Main Content</h2>

          <div>
            {data?.crashes_list_view?.map((crash) => (
              <p
                key={crash.id}
              >{`${crash.address_primary} (${crash.cris_crash_id})`}</p>
            ))}
          </div>
        </Col>
      </Row>
    </Container>
  );
}
