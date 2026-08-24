import { useRef, useState } from "react";
import Link from "next/link";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { MapRef } from "react-map-gl";
import CrashMapCoordinateForm from "@/components/CrashMapCoordinateForm";
import {
  PointMap,
  LatLonString,
  LatLonSchema,
  LatLon,
  CoordinateValidationError,
} from "@/components/PointMap";
import { useMutation } from "@/utils/graphql";
import { useResizeObserver } from "@/utils/map";
import { DEFAULT_MAP_PAN_ZOOM } from "@/configs/map";
import PermissionsRequired from "@/components/PermissionsRequired";
import AlignedLabel from "@/components/AlignedLabel";
import { LuSquarePen } from "react-icons/lu";
import { Location } from "@/types/locations";
import LocationPolygonLayer from "@/components/LocationPolygonLayer";

const allowedMapEditRoles = ["vz-admin", "editor"];

const formattedGeoProvider = {
  cris: "TxDOT CRIS",
  apd_cad: "APD CAD",
  manual_qa: "Manual Q/A",
};

interface CrashMapCardProps {
  savedLatitude: number | null;
  savedLongitude: number | null;
  crashId: number;
  onSaveCallback: () => Promise<void>;
  mutation: string;
  locationId: string | null;
  geolocationProvider: string;
  location?: Location | null;
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
  geolocationProvider,
  location,
}: CrashMapCardProps) {
  const mapRef = useRef<MapRef | null>(null);
  /**
   * Trigger resize() when the map container size changes - this ensures that
   * the map repaints when the sidebar is collapsed/expanded.
   */
  const mapContainerRef = useResizeObserver<HTMLDivElement>(() => {
    mapRef.current?.resize();
  });

  const [isEditing, setIsEditing] = useState(false);
  const [draftLatLon, setDraftLatLon] = useState<LatLon>({
    latitude: DEFAULT_MAP_PAN_ZOOM.latitude,
    longitude: DEFAULT_MAP_PAN_ZOOM.longitude,
  });
  const [formLatLon, setFormLatLon] = useState<LatLonString>({
    latitude: String(DEFAULT_MAP_PAN_ZOOM.latitude),
    longitude: String(DEFAULT_MAP_PAN_ZOOM.longitude),
  });
  const [validationError, setValidationError] =
    useState<CoordinateValidationError>();
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
            {hasCoordinates
              ? formattedGeoProvider[geolocationProvider]
              : "No Primary Coordinates"}
          </span>
        </div>
      </Card.Header>
      <Card.Body className="p-1 crash-header-card-body" ref={mapContainerRef}>
        <PointMap
          savedLatitude={savedLatitude}
          savedLongitude={savedLongitude}
          isEditing={isEditing}
          draftLatLon={draftLatLon}
          setDraftLatLon={setDraftLatLon}
          mapRef={mapRef}
        >
          {location && <LocationPolygonLayer location={location} />}
        </PointMap>
      </Card.Body>
      <Card.Footer>
        <PermissionsRequired allowedRoles={allowedMapEditRoles}>
          <div
            className={`d-flex align-items-center ${isEditing ? "justify-content-between" : "justify-content-end"}`}
          >
            {isEditing && (
              <div className="flex-grow-1">
                <CrashMapCoordinateForm
                  draftLatLon={draftLatLon}
                  formLatLon={formLatLon}
                  setFormLatLon={setFormLatLon}
                  validationError={validationError}
                  setValidationError={setValidationError}
                />
              </div>
            )}
            <div className="d-flex text-nowrap d-flex align-items-center justify-content-end">
              <Button
                size="sm"
                variant="primary"
                disabled={isMutating}
                onClick={async () => {
                  if (!isEditing) {
                    setIsEditing(true);
                  } else {
                    // check if form coords match edit coords from map
                    let coordinatesToSave = { ...draftLatLon };
                    if (
                      String(draftLatLon.latitude) !== formLatLon.latitude ||
                      String(draftLatLon.longitude) !== formLatLon.longitude
                    ) {
                      // validate string coords
                      // convert coordinates to numbers and validate them
                      const parsedData = LatLonSchema.safeParse(formLatLon);
                      if (!parsedData.success) {
                        setValidationError(parsedData.error.format());
                        return;
                      } else {
                        coordinatesToSave = { ...parsedData.data };
                        // pan to the saved location
                        mapRef.current?.panTo([
                          coordinatesToSave.longitude,
                          coordinatesToSave.latitude,
                        ]);
                      }
                    }
                    setValidationError(undefined);
                    await mutate({
                      id: crashId,
                      updates: coordinatesToSave,
                    });
                    await onSaveCallback();
                    setIsEditing(false);
                  }
                }}
              >
                {isEditing ? (
                  "Save"
                ) : (
                  <AlignedLabel>
                    <LuSquarePen className="me-2" />
                    Edit
                  </AlignedLabel>
                )}
              </Button>
              {isEditing && (
                <Button
                  className="ms-1"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setValidationError(undefined);
                    // reset map position
                    const resetLngLat: [number, number] = hasCoordinates
                      ? [savedLongitude, savedLatitude]
                      : [
                          DEFAULT_MAP_PAN_ZOOM.longitude,
                          DEFAULT_MAP_PAN_ZOOM.latitude,
                        ];
                    mapRef.current?.panTo(resetLngLat);
                  }}
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
