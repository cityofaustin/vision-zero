import { useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { MapRef } from "react-map-gl";
import { CrashMap } from "@/components/CrashMap";
import { useMutation } from "@/utils/graphql";
import { useResizeObserver } from "@/utils/map";
import { LatLon } from "@/components/CrashMap";

interface CrashMapCardProps {
  savedLatitude: number | null;
  savedLongitude: number | null;
  crashId: number;
  onSaveCallback: () => Promise<void>;
  mutation: string;
}

/**
 * Card component that renders the crash map and edit controls
 */
export default function CrashMapCard({
  crashId,
  savedLatitude,
  savedLongitude,
  onSaveCallback,
  mutation,
}: CrashMapCardProps) {
  const mapRef = useRef<MapRef | null>(null);
  const mapContainerRef = useResizeObserver<HTMLDivElement>(() => {
    mapRef.current?.resize();
  });

  const [isEditingCoordinates, setIsEditingCoordinates] = useState(false);
  const [editCoordinates, setEditCoordinates] = useState<LatLon>({
    latitude: 0,
    longitude: 0,
  });
  const { mutate, loading: isMutating } = useMutation(mutation);

  /**
   * Trigger resize() when the map container size changes - this ensures that
   * the map repaints when the sidebar is collased/expanded.
   */

  return (
    <Card>
      <Card.Header>Location</Card.Header>
      <Card.Body className="p-1 crash-header-card-body" ref={mapContainerRef}>
        <CrashMap
          savedLatitude={savedLatitude}
          savedLongitude={savedLongitude}
          isEditing={isEditingCoordinates}
          editCoordinates={editCoordinates}
          setEditCoordinates={setEditCoordinates}
          mapRef={mapRef}
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
              disabled={isMutating}
              onClick={async () => {
                if (!isEditingCoordinates) {
                  setIsEditingCoordinates(true);
                } else {
                  await mutate({
                    id: crashId,
                    updates: { ...editCoordinates },
                  });
                  await onSaveCallback();
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
                disabled={isMutating}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </Card.Footer>
    </Card>
  );
}
