import { useState } from "react";
import { useRouter } from "next/router";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { CrashMap } from "@/components/CrashMap";
import { GET_CRASH, UPDATE_CRASH } from "@/queries/crash";
import { useQuery, useMutation } from "@/utils/graphql";
import CrashHeader from "@/components/CrashHeader";
import CrashDiagramCard from "@/components/CrashDiagramCard";
import CrashDataCard from "@/components/CrashDataCard";
import CrashChangeLog from "@/components/CrashChangeLog";
import { crashDataCards } from "@/configs/crashDataCard";
import { Crash, LatLon } from "@/types/types";

export default function CrashDetailsPage() {
  const [isEditingCoordinates, setIsEditingCoordinates] = useState(false);
  const [editCoordinates, setEditCoordinates] = useState<LatLon>({
    latitude: 0,
    longitude: 0,
  });
  const router = useRouter();
  const recordLocator = router.query.record_locator;

  const { data, refetch, isLoading, isValidating } = useQuery<{
    crashes: Crash[];
  }>({
    // todo: is the router ever not ready - ie do we need this ternary?
    query: recordLocator ? GET_CRASH : undefined,
    variables: { recordLocator },
  });

  const { mutate, loading: isMutating } = useMutation(UPDATE_CRASH);

  if (!data || !data?.crashes?.[0]) {
    // todo: 404 page
    return;
  }

  const crash = data.crashes[0];

  // todo: this won't scale?
  const isLoadingAnything = isLoading || isMutating || isValidating;

  return (
    <>
      <CrashHeader crash={crash} />
      <Row>
        <Col sm={12} md={6} lg={4} className="mb-3">
          <Card>
            <Card.Header>Location</Card.Header>
            <Card.Body className="p-1 crash-header-card-body">
              <CrashMap
                savedLatitude={crash.latitude}
                savedLongitude={crash.longitude}
                isEditing={isEditingCoordinates}
                editCoordinates={editCoordinates}
                setEditCoordinates={setEditCoordinates}
              />
            </Card.Body>
            <Card.Footer>
              <div className="d-flex justify-content-between">
                <div>
                  <span>Geocode provider</span>
                </div>
                <div>
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={isLoadingAnything}
                    onClick={async () => {
                      if (!isEditingCoordinates) {
                        setIsEditingCoordinates(true);
                      } else {
                        await mutate({
                          id: crash.id,
                          updates: { ...editCoordinates },
                        });
                        await refetch();
                        setIsEditingCoordinates(false);
                      }
                    }}
                  >
                    {isEditingCoordinates ? "Save location" : "Edit"}
                  </Button>
                  {isEditingCoordinates && (
                    <Button
                      className="ms-1"
                      size="sm"
                      variant="danger"
                      onClick={() => setIsEditingCoordinates(false)}
                      disabled={isLoadingAnything}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </Card.Footer>
          </Card>
        </Col>
        <Col sm={12} md={6} lg={4} className="mb-3">
          <CrashDiagramCard crash={crash} />
        </Col>
        <Col sm={12} md={6} lg={4} className="mb-3">
          <Card>
            <Card.Header>Narrative</Card.Header>
            <Card.Body className="crash-header-card-body">
              <Card.Text>{crash.investigator_narrative || ""}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col sm={12} md={6} lg={4} className="mb-3">
          <CrashDataCard
            crash={crash}
            isValidating={isValidating}
            title="Summary"
            columns={crashDataCards.summary}
            refetch={refetch}
          />
        </Col>
        <Col sm={12} md={6} lg={4} className="mb-3">
          <CrashDataCard
            crash={crash}
            isValidating={isValidating}
            title="Flags"
            columns={crashDataCards.flags}
            refetch={refetch}
          />
        </Col>
        <Col sm={12} md={6} lg={4} className="mb-3">
          <CrashDataCard
            crash={crash}
            isValidating={isValidating}
            title="Other"
            columns={crashDataCards.other}
            refetch={refetch}
          />
        </Col>
      </Row>
      <Row>
        <Col sm={12} md={6} lg={4} className="mb-3">
          <CrashDataCard
            crash={crash}
            isValidating={isValidating}
            title="Primary address"
            columns={crashDataCards.address}
            refetch={refetch}
          />
        </Col>
        <Col sm={12} md={6} lg={4} className="mb-3">
          <CrashDataCard
            crash={crash}
            isValidating={isValidating}
            title="Secondary address"
            columns={crashDataCards.address_secondary}
            refetch={refetch}
          />
        </Col>
      </Row>
      <Row className="mb-5">
        <Col>{crash && <CrashChangeLog logs={crash.change_logs} />}</Col>
      </Row>
    </>
  );
}
