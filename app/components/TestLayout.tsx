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
  const { loginWithRedirect, logout, isAuthenticated, isLoading, user } =
    useAuth0();
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
    // d-flex in outer causes horizontal columns (row)
    <div
      style={{ height: "100vh", overflow: "hidden" }}
      className="bg-secondary-subtle d-flex"
    >
      {/* Sidebar - width specified */}
      <div
        className="bg-dark"
        style={{ minWidth: "15rem", overflowX: "hidden" }}
      >
        <p className="text-white">sidebar item</p>
        <p className="text-white">sidebar item</p>
        <p className="text-white">sidebar item</p>
        <p className="text-white">sidebar item</p>
        <p className="text-white">sidebar item</p>
        <p className="text-white">sidebar item</p>
        <p className="text-white">sidebar item</p>
        <p className="text-white">sidebar item</p>
        <p className="text-white">sidebar item</p>
      </div>
      {/* Main content - grows to fill rest of horizontal
      - also a flexbox column, causing its children to stack verticaly */}
      <div
        id="non-sidebar"
        className="bg-danger-subtle flex-grow-1 d-flex flex-column w-100"
        style={{ minWidth: 0 }}
      >
        <AppNavBar user={user} logout={logout} />
        {/* main content grows to fill vertical */}
        <main
          className="px-3 bg-info flex-grow-1"
          style={{ overflowY: "auto" }}
        >
          {children}
        </main>
        <div className="bg-dark text-white">
          <span>footer</span>
        </div>
      </div>
    </div>
  );
}
