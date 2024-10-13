import { useRouter } from "next/router";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { CrashMap } from "@/components/Map";
import { CRASH_QUERY } from "@/queries/crash";
import { useGraphQL } from "@/components/client";
import CrashHeader from "@/components/CrashHeader";
import CrashDiagramCard from "@/components/CrashDiagramCard";
import { Crash } from "@/types/types";

export default function CrashDetailsPage() {
  const router = useRouter();
  const recordLocator = router.query.record_locator;

  // todo: handle when router isn't ready to prevent gql error
  const { data, error, isLoading } = useGraphQL<{ crashes: Crash[] }>({
    query: CRASH_QUERY,
    variables: { recordLocator },
  });

  if (!data || !data?.crashes?.[0]) {
    return;
  }

  const crash = data.crashes[0];

  return (
    <Container fluid style={{ height: "100vh", overflow: "hidden" }}>
      <Row className="h-100">
        {/* Main content */}
        <Col
          style={{
            height: "100vh",
            overflowY: "auto",
          }}
        >
          <CrashHeader crash={crash} />
          <Row>
            <Col sm={12} md={6} lg={4} className="mb-3">
              <Card>
                <Card.Header>Location</Card.Header>
                <Card.Body className="p-1 crash-header-card-body">
                  <CrashMap
                    latitude={crash.latitude}
                    longitude={crash.longitude}
                  />
                </Card.Body>
                <Card.Footer>
                  <div className="d-flex justify-content-between">
                    <span>Geocode provider</span>
                    <Button size="sm" variant="primary">
                      Edit coordinates
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            </Col>
            <Col sm={12} md={6} lg={4}>
              <CrashDiagramCard crash={crash} />
            </Col>
            <Col sm={12} md={6} lg={4}>
              <Card>
                <Card.Header>Narrative</Card.Header>
                <Card.Body className="crash-header-card-body">
                  <Card.Text>{crash.investigator_narrative || ""}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}
