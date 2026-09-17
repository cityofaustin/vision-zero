import { useRef } from "react";
import Card from "react-bootstrap/Card";
import { MapRef } from "react-map-gl";
import { useResizeObserver } from "@/utils/map";
import { PointMap } from "@/components/PointMap";
import { Location } from "@/types/locations";
import LocationPolygonLayer from "@/components/LocationPolygonLayer";

/**
 * Card component that renders the location polygon map
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
          <PointMap mapRef={mapRef}>
            <LocationPolygonLayer location={location} />
          </PointMap>
        )}
      </Card.Body>
    </Card>
  );
}
