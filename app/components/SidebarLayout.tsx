import { ReactNode, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth0 } from "@auth0/auth0-react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import ListGroup from "react-bootstrap/ListGroup";
import {
  FaShieldHeart,
  FaGaugeHigh,
  FaMap,
  FaAngleRight,
  FaRightToBracket,
  FaRightFromBracket,
} from "react-icons/fa6";
import SideBarListItem from "./SideBarListItem";

const localStorageKey = "sidebarCollapsed";

export default function SidebarLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const {
    isLoading: isLoadingAuth,
    error: errorAuth,
    user,
    loginWithRedirect,
    logout,
  } = useAuth0();

  const toggleSidebar = useCallback(
    () =>
      setIsCollapsed((prevSate) => {
        localStorage.setItem(localStorageKey, String(!prevSate));
        return !prevSate;
      }),
    []
  );

  /** Check local storage for initialsidebar state */
  useEffect(() => {
    const collapsedFromStorage =
      localStorage.getItem(localStorageKey) === "true";
    setIsCollapsed(collapsedFromStorage);
  }, []);

  return (
    <Container fluid style={{ height: "100vh", overflow: "hidden" }}>
      <Row className="h-100">
        {/* Sidebar */}
        <div
          className={`bg-dark text-white p-0 app-sidebar app-sidebar-${
            isCollapsed ? "collapsed" : "expanded"
          }`}
        >
          <div className="d-flex flex-column h-100">
            <div>
              <Button
                onClick={toggleSidebar}
                variant="dark"
                className="w-100 text-secondary"
              >
                <FaAngleRight
                  className={`sidebar-toggle-${
                    isCollapsed ? "closed" : "open"
                  }`}
                />
              </Button>
            </div>

            <ListGroup variant="flush">
              <SideBarListItem
                isCollapsed={isCollapsed}
                isCurrentPage={router?.route === "/"}
                Icon={FaGaugeHigh}
                label="Dashboard"
                href="/"
              />
              <SideBarListItem
                isCollapsed={isCollapsed}
                isCurrentPage={router?.route === "/crashes"}
                Icon={FaShieldHeart}
                label="Crashes"
                href="/crashes"
              />
              <SideBarListItem
                isCollapsed={isCollapsed}
                isCurrentPage={router?.route === "/locations"}
                Icon={FaMap}
                label="Locations"
                href="/locations"
              />

              {/* login / logout button  */}
              <ListGroup.Item
                className="mx-1 bg-dark fs-5 my-1"
                style={{
                  whiteSpace: "nowrap",
                  border: "none",
                }}
              >
                {!isLoadingAuth && !errorAuth && !user && (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => loginWithRedirect()}
                  >
                    <span>
                      <FaRightToBracket />
                    </span>
                    {!isCollapsed && <span className="ms-2">Sign in</span>}
                  </Button>
                )}
                {user && (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => logout()}
                  >
                    <span>
                      <FaRightFromBracket />
                    </span>
                    {!isCollapsed && <span className="ms-2">Sign out</span>}
                  </Button>
                )}
              </ListGroup.Item>
            </ListGroup>
          </div>
        </div>
        {/* Main content */}

        <Col
          style={{
            height: "100vh",
            overflowY: "auto",
          }}
        >
          <main>{children}</main>
        </Col>
      </Row>
    </Container>
  );
}
