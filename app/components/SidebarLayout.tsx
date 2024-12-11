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
  FaLocationDot,
  FaAngleRight,
  FaUserGroup,
} from "react-icons/fa6";
import AppNavBar from "./AppNavBar";
import SideBarListItem from "./SideBarListItem";
import LoginContainer from "./LoginCotainer";
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

  /**
   * Hook which keeps refreshes the user's token in localstorage and redirects to the
   * Auth0 login page if the token is expired
   */
  useEffect(() => {
    const refreshToken = async () => {
      /**
       * No reason to do this if the user is not authenticated, since the login
       * page will render anyway
       */
      if (isAuthenticated) {
        try {
          /**
           * getAccessTokenSilently will fetch a fresh token if current token is still valid,
           * otherwise it will throw and the user will be redirected to the Auth0
           * login page
           */
          await getAccessTokenSilently();
        } catch (error) {
          console.error("Failed to refresh token:", error);
          loginWithRedirect({
            appState: {
              returnTo: pathName,
            },
          });
        }
      }
    };

    refreshToken();

    const intervalId = setInterval(refreshToken, 60 * 5 * 1000); // Every 5 minutes
    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [getAccessTokenSilently, loginWithRedirect, isAuthenticated, pathName]);

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
          className={`bg-dark text-white p-0 app-sidebar app-sidebar-${
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
                Icon={FaLocationDot}
                label="Locations"
                href="/locations"
              />
              <SideBarListItem
                isCollapsed={isCollapsed}
                isCurrentPage={segments.includes("users")}
                Icon={FaUserGroup}
                label="Users"
                href="/users"
              />
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
