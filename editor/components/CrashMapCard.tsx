import { useRef, useState } from "react";
import Link from "next/link";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { MapRef } from "react-map-gl";
import CrashMapCoordinateForm from "@/components/CrashMapCoordinateForm";
import { CrashMap } from "@/components/CrashMap";
import { useMutation } from "@/utils/graphql";
import { useResizeObserver } from "@/utils/map";
import { LatLon } from "@/components/CrashMap";

import PermissionsRequired from "@/components/PermissionsRequired";

const allowedMapEditRoles = ["vz-admin", "editor"];

interface CrashMapCardProps {
  savedLatitude: number | null;
  savedLongitude: number | null;
  crashId: number;
  onSaveCallback: () => Promise<void>;
  mutation: string;
  locationId: string | null;
  isManualGeocode: boolean | null;
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
  locationId,
  isManualGeocode,
}: CrashMapCardProps) {
  const mapRef = useRef<MapRef | null>(null);
  /**
   * Trigger resize() when the map container size changes - this ensures that
   * the map repaints when the sidebar is collased/expanded.
   */
  const mapContainerRef = useResizeObserver<HTMLDivElement>(() => {
    mapRef.current?.resize();
  });

  const [isEditingCoordinates, setIsEditingCoordinates] = useState(false);
  const [editCoordinates, setEditCoordinates] = useState<LatLon>({
    latitude: 0,
    longitude: 0,
  });
  const { mutate, loading: isMutating } = useMutation(mutation);

  const hasCoordinates = !!savedLatitude && !!savedLongitude;

  const hasLocation = !!locationId;

  return (
    <Card className="h-100">
      <Card.Header className="d-flex justify-content-between">
        <div>
          <span className="fw-bold me-2">Location</span>
          {hasLocation ? (
            <Link href={`/locations/${locationId}`}>{locationId}</Link>
          ) : (
            <span className="text-secondary">unassigned</span>
          )}
        </div>
        <div>
          <span className="fw-bold me-2">Provider </span>
          <span>
            {" "}
            {hasCoordinates
              ? isManualGeocode
                ? "Manual Q/A"
                : "TxDOT CRIS"
              : "No Primary Coordinates"}
          </span>
        </div>
      </Card.Header>
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
        <PermissionsRequired allowedRoles={allowedMapEditRoles}>
          <div
            className={`d-flex align-items-center ${isEditingCoordinates ? "justify-content-between" : "justify-content-end"}`}
          >
            {isEditingCoordinates && (
              <div className="flex-grow-1">
                <CrashMapCoordinateForm
                  editCoordinates={editCoordinates}
                  setEditCoordinates={setEditCoordinates}
                />
              </div>
            )}
            <div className="d-flex text-nowrap d-flex align-items-center justify-content-end">
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
                {isEditingCoordinates ? "Save" : "Edit"}
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
        </PermissionsRequired>
      </Card.Footer>
    </Card>
  );
}
