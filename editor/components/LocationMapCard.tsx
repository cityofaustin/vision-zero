import { useRef } from "react";
import Card from "react-bootstrap/Card";
import { MapRef } from "react-map-gl";
import { useResizeObserver } from "@/utils/map";
import { LocationMap } from "./LocationMap";
import { Location } from "@/types/locations";

/**
 * Card component that renders the crash map and edit controls
 */
export default function LocationMapCard({ location }: { location: Location }) {
  const mapRef = useRef<MapRef | null>(null);
  /**
   * Trigger resize() when the map container size changes - this ensures that
   * the map repaints when the sidebar is collapsed/expanded.
   */
  const mapContainerRef = useResizeObserver<HTMLDivElement>(() => {
    mapRef.current?.resize();
  });

  return (
    <Card>
      <Card.Header>
        <Card.Title>Location</Card.Title>
      </Card.Header>
      <Card.Body className="p-1 crash-header-card-body" ref={mapContainerRef}>
        {location.geometry && (
          <LocationMap
            polygon={location.geometry}
            locationId={location.location_id}
            mapRef={mapRef}
            useColorStreets={true}
          />
        )}
      </Card.Body>
    </Card>
  );
}
