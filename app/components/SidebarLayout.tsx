import { ReactNode, useState, useCallback } from "react";
import Link from "next/link";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";

export default function SidebarLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const toggleSidebar = useCallback(
    () => setCollapsed((prevSate) => !prevSate),
    []
  );
  return (
    <Container fluid style={{ height: "100vh", overflow: "hidden" }}>
      <Row className="h-100">
        {/* Sidebar */}
        <div
          //   xs={collapsed ? "auto" : 2}
          className={`bg-dark text-white p-0 app-sidebar app-sidebar-${
            collapsed ? "collapsed" : "expanded"
          }`}
        >
          <div className="d-flex flex-column h-100">
            <Button onClick={toggleSidebar} variant="dark">
              {collapsed ? ">" : "<"}
            </Button>
            {!collapsed && (
              <ListGroup variant="flush">
                <ListGroup.Item
                  className="bg-dark text-light"
                  style={{ cursor: "pointer" }}
                  action
                  as={Link}
                  href="/"
                >
                  Dashboard
                </ListGroup.Item>
                <ListGroup.Item
                  className="bg-dark text-light"
                  style={{ cursor: "pointer" }}
                  action
                  as={Link}
                  href="/"
                >
                  Crashes
                </ListGroup.Item>
                <ListGroup.Item
                  className="bg-dark text-light"
                  style={{ cursor: "pointer" }}
                  action
                  as={Link}
                  href="/"
                >
                  Locations
                </ListGroup.Item>
              </ListGroup>
            )}
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
