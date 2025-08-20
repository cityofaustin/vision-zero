"use client";
import { ReactNode, useState, useCallback, useEffect } from "react";
import { usePathname, useSelectedLayoutSegments } from "next/navigation";
import { useAuth0 } from "@auth0/auth0-react";
import ListGroup from "react-bootstrap/ListGroup";
import AppNavBar from "@/components/AppNavBar";
import SideBarListItem from "@/components/SideBarListItem";
import LoginContainer from "@/components/LoginContainer";
import { routes } from "@/configs/routes";
import PermissionsRequired from "@/components/PermissionsRequired";
import AppBreadCrumb from "@/components/AppBreadCrumb";
import AppFooter from "@/components/AppFooter";
import { darkModeLocalStorageKey } from "@/components/DarkModeToggle";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

/**
 * The app sidebar component
 */
export default function SidebarLayout({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const { loginWithRedirect, logout, isAuthenticated, isLoading, user } =
    useAuth0();
  const pathName = usePathname();
  const segments = useSelectedLayoutSegments();

  const handleMouseEnter = useCallback(() => {
    if (isCollapsed) {
      const timeout = setTimeout(() => {
        setIsCollapsed(false);
      }, 250);
      setHoverTimeout(timeout);
    }
  }, [isCollapsed]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    if (!isCollapsed) {
      setIsCollapsed(true);
    }
  }, [hoverTimeout, isCollapsed]);

  /** Check dark mode */
  useEffect(() => {
    const isDarkMode = localStorage.getItem(darkModeLocalStorageKey) === "dark";

    document.documentElement.setAttribute(
      "data-bs-theme",
      isDarkMode ? "dark" : "light"
    );
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  if (isLoading) {
    /**
     * We don't want to render anything before initial auth check resolves
     * otherwise we end up with dom elements flashing on the screen,
     * and weird side effects can happen if we load pages without
     * being logged in. e.g. the graphql query hook can get hung up
     */
    return null;
  }

  /**
   * Render the login page if needed
   */
  if (!isAuthenticated || !user) {
    return (
      <div
        className="d-flex flex-column"
        style={{ height: "100vh", overflow: "hidden" }}
      >
        <LoginContainer
          onLogin={() =>
            loginWithRedirect({
              appState: {
                returnTo: BASE_PATH + pathName,
              },
            })
          }
        />
      </div>
    );
  }

  /**
   * Render the app
   */
  return (
    // Full-height outer div stacks children vertically
    <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>
      <AppNavBar user={user} logout={logout} />
      {/* Sidebar */}
      <div
        className={`app-sidebar d-flex flex-column h-100 app-sidebar-${
          isCollapsed ? "collapsed" : "expanded"
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex-grow-1 overflow-y-auto">
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
      {/* Main content - essentialy a boostrap "row" — horizontal */}
      <div className="main-content-pane d-flex flex-grow-1">
        <div className="flex-grow-1 d-flex flex-column w-100 ">
          {/* vertical container */}
          <main className="flex-grow-1 d-flex flex-column">
            <div className="d-flex flex-grow-1 flex-column p-3">
              <AppBreadCrumb />
              {children}
            </div>
            <AppFooter />
          </main>
        </div>
      </div>
    </div>
  );
}
