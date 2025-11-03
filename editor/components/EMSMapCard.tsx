import { useRef } from "react";
import Card from "react-bootstrap/Card";
import { MapRef } from "react-map-gl";
import { PointMap } from "@/components/PointMap";
import { useResizeObserver } from "@/utils/map";

interface EMSMapCardProps {
  savedLatitude: number | null;
  savedLongitude: number | null;
}

/**
 * Card component that renders the crash map with no editing capabilities
 */
export default function EMSMapCard({
  savedLatitude,
  savedLongitude,
}: EMSMapCardProps) {
  const mapRef = useRef<MapRef | null>(null);
  /**
   * Trigger resize() when the map container size changes - this ensures that
   * the map repaints when the sidebar is collapsed/expanded.
   */
  const mapContainerRef = useResizeObserver<HTMLDivElement>(() => {
    mapRef.current?.resize();
  });

  return (
    <Card className="h-100">
      <Card.Body className="p-1 crash-header-card-body" ref={mapContainerRef}>
        <PointMap
          savedLatitude={savedLatitude}
          savedLongitude={savedLongitude}
          mapRef={mapRef}
        />
      </Card.Body>
    </Card>
  );
}
