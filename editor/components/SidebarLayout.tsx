"use client";
import { ReactNode, useState, useCallback, useEffect } from "react";
import { usePathname, useSelectedLayoutSegments } from "next/navigation";
import { useAuth0 } from "@auth0/auth0-react";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import { FaAngleRight } from "react-icons/fa6";
import AppNavBar from "@/components/AppNavBar";
import SideBarListItem from "@/components/SideBarListItem";
import LoginContainer from "@/components/LoginContainer";
import { routes } from "@/configs/routes";
import PermissionsRequired from "@/components/PermissionsRequired";
import AppBreadCrumb from "@/components/AppBreadCrumb";
import AppFooter from "@/components/AppFooter";
import { darkModelocalStorageKey } from "@/components/DarkModeToggle";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

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

  /** Check local storage for initial sidebar state and dark mode */
  useEffect(() => {
    const collapsedFromStorage =
      localStorage.getItem(localStorageKey) === "true";
    setIsCollapsed(collapsedFromStorage);
    const isDarkMode = localStorage.getItem(darkModelocalStorageKey) === "true";
    if (isDarkMode) {
      document.documentElement.setAttribute("data-bs-theme", "dark");
    }
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
              returnTo: BASE_PATH + pathName,
            },
          })
        }
      />
    );
  }

  return (
    <div style={{ height: "100vh", overflow: "hidden" }} className="d-flex">
      {/* Sidebar */}
      <div
        className={`bg-dark app-sidebar app-sidebar-${
          isCollapsed ? "collapsed" : "expanded"
        }`}
      >
        <div className="p-2">
          <Button
            onClick={toggleSidebar}
            variant="dark"
            className="w-100 text-secondary"
          >
            <FaAngleRight
              className={`sidebar-toggle-${isCollapsed ? "closed" : "open"}`}
            />
          </Button>
        </div>
        <ListGroup variant="flush" className="px-2">
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
      {/* Main content */}
      <div
        className="flex-grow-1 d-flex flex-column w-100"
        style={{ minWidth: 0 }}
      >
        <AppNavBar user={user} logout={logout} />
        <main
          className="flex-grow-1 d-flex flex-column"
          style={{
            overflowY: "auto",
          }}
        >
          <AppBreadCrumb />
          <div className="flex-grow-1 px-3 pb-3">{children}</div>
          <AppFooter />
        </main>
      </div>
    </div>
  );
}
