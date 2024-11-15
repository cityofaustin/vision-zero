"use client";
import { ReactNode, useState, useCallback, useEffect } from "react";
import { usePathname, useSelectedLayoutSegments } from "next/navigation";
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
  FaRightFromBracket,
} from "react-icons/fa6";
import SideBarListItem from "./SideBarListItem";

const localStorageKey = "sidebarCollapsed";

export default function SidebarLayout({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { loginWithRedirect, logout, isAuthenticated, isLoading } = useAuth0();
  const pathName = usePathname();
  const segments = useSelectedLayoutSegments();

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

  if (isLoading) {
    /**
     * We don't want to render anything before initial auth check resolves
     * otherwise we end up with dom elements flashing on the screen,
     * and weird side effects can happen if we load pages without
     * being logged in. e.g. the graphql query hook can get hung up
     */
    return null;
  }

  if (!isAuthenticated && !isLoading) {
    return (
      <Container
        fluid
        style={{ height: "100vh", overflow: "hidden" }}
        className="bg-dark"
      >
        <div className="d-flex justify-content-center align-content-center h-100">
          <div className="align-self-center p-5 bg-white rounded text-center">
            <h1 className="mb-5">Vision Zero Editor</h1>
            <Button
              onClick={() =>
                loginWithRedirect({
                  appState: {
                    returnTo: pathName,
                  },
                })
              }
              size="lg"
            >
              <span>Sign In</span>
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid style={{ height: "100vh", overflow: "hidden" }}>
      <Row className="h-100">
        {/* Sidebar */}
        <div
          className={`bg-dark text-white p-0 app-sidebar app-sidebar-${
            isCollapsed ? "collapsed" : "expanded"
          }`}
          style={{ overflowX: "hidden" }}
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
                isCurrentPage={segments.includes("dashboard")}
                Icon={FaGaugeHigh}
                label="Dashboard"
                href="/dashboard"
              />
              <SideBarListItem
                isCollapsed={isCollapsed}
                isCurrentPage={segments.includes("crashes")}
                Icon={FaShieldHeart}
                label="Crashes"
                href="/crashes"
              />
              <SideBarListItem
                isCollapsed={isCollapsed}
                isCurrentPage={segments.includes("locations")}
                Icon={FaMap}
                label="Locations"
                href="/locations"
              />

              {/* login / logout button  */}
              <ListGroup.Item
                className="bg-dark fs-5 my-1 text-primary"
                style={{
                  whiteSpace: "nowrap",
                  border: "none",
                }}
                action
                onClick={() => logout()}
              >
                <span>
                  <FaRightFromBracket className="me-3" />
                  {isCollapsed ? null : "Sign out"}
                </span>
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
