import { useRouter } from "next/router";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { CrashMap } from "@/components/CrashMap";
import { CRASH_QUERY } from "@/queries/crash";
import { useGraphQL } from "@/utils/graphql";
import CrashHeader from "@/components/CrashHeader";
import CrashDiagramCard from "@/components/CrashDiagramCard";
import CrashDataCard from "@/components/CrashDataCard";
import { crashDataCardColumns } from "@/configs/crashDataCard";
import { Crash } from "@/types/types";

export default function CrashDetailsPage() {
  const router = useRouter();
  const recordLocator = router.query.record_locator;

  // todo: handle when router isn't ready to prevent gql error
  const { data } = useGraphQL<{ crashes: Crash[] }>({
    query: CRASH_QUERY,
    variables: { recordLocator },
  });

  if (!data || !data?.crashes?.[0]) {
    return;
  }

  const crash = data.crashes[0];

  return (
    <>
      <CrashHeader crash={crash} />
      <Row>
        <Col sm={12} md={6} lg={4} className="mb-3">
          <Card>
            <Card.Header>Location</Card.Header>
            <Card.Body className="p-1 crash-header-card-body">
              <CrashMap latitude={crash.latitude} longitude={crash.longitude} />
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
      <Row>
        <Col sm={12} md={6} lg={4}>
          <CrashDataCard
            crash={crash}
            title="Summary"
            columns={crashDataCardColumns}
          />
        </Col>
      </Row>
    </>
  );
}
