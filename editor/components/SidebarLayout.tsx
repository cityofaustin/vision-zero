"use client";
import { ReactNode, useState, useCallback, useEffect } from "react";
import { usePathname, useSelectedLayoutSegments } from "next/navigation";
import { useAuth0 } from "@auth0/auth0-react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import ListGroup from "react-bootstrap/ListGroup";
import { FaAngleRight } from "react-icons/fa6";
import AppNavBar from "@/components/AppNavBar";
import SideBarListItem from "@/components/SideBarListItem";
import LoginContainer from "@/components/LoginContainer";
import { routes } from "@/configs/routes";
import PermissionsRequired from "@/components/PermissionsRequired";

const localStorageKey = "sidebarCollapsed";

/**
 * The app sidebar component
 */
export default function SidebarLayout({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const {
    getAccessTokenSilently,
    loginWithRedirect,
    logout,
    isAuthenticated,
    isLoading,
    user,
  } = useAuth0();
  const pathName = usePathname();
  const segments = useSelectedLayoutSegments();

  const toggleSidebar = useCallback(
    () =>
      setIsCollapsed((prevState) => {
        localStorage.setItem(localStorageKey, String(!prevState));
        return !prevState;
      }),
    []
  );

  useEffect(() => {
    console.log("Checking if user is Authenticated...");
    if (!isAuthenticated) {
      console.log("Getting access token silently...");
      getAccessTokenSilently().catch(() => {
        console.log("User not authenticated...");
      });
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  /** Check local storage for initial sidebar state */
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

  if (!isAuthenticated || !user) {
    return (
      <LoginContainer
        onLogin={() =>
          loginWithRedirect({
            appState: {
              returnTo: pathName,
            },
          })
        }
      />
    );
  }

  return (
    <Container fluid style={{ height: "100vh", overflow: "hidden" }}>
      <Row className="h-100">
        {/* Sidebar */}
        <div
          className={`bg-dark p-0 app-sidebar app-sidebar-${
            isCollapsed ? "collapsed" : "expanded"
          }`}
          style={{ overflowX: "hidden" }}
        >
          <div className="d-flex flex-column h-100">
            <div className="p-2">
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
              {routes.map((route) => (
                <PermissionsRequired
                  allowedRoles={route.allowedRoles}
                  key={route.path}
                >
                  <SideBarListItem
                    isCollapsed={isCollapsed}
                    isCurrentPage={segments.includes(route.path)}
                    Icon={route.icon}
                    label={route.label}
                    href={`/${route.path}`}
                  />
                </PermissionsRequired>
              ))}
            </ListGroup>
          </div>
        </div>
        {/* Main content */}
        <Col
          style={{
            height: "100vh",
            overflowY: "auto",
          }}
          className="p-0"
        >
          <AppNavBar user={user} logout={logout} />
          <main className="px-3">{children}</main>
        </Col>
      </Row>
    </Container>
  );
}
