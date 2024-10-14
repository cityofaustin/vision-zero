import { ReactNode, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import {
  FaShieldHeart,
  FaGaugeHigh,
  FaMap,
  FaAngleRight,
} from "react-icons/fa6";
import SideBarListItem from "./SideBarListItem";

const localStorageKey = "sidebarCollapsed";

export default function SidebarLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
            <div className="d-flex justify-content-end">
              <Button
                onClick={toggleSidebar}
                variant="dark"
                className={`text-secondary sidebar-toggle-${isCollapsed ? "closed" : "open"}`}
              >
                <FaAngleRight />
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
