import { useRef } from "react";
import Card from "react-bootstrap/Card";
import { MapRef } from "react-map-gl";
import { PointMap } from "@/components/PointMap";
import { useResizeObserver } from "@/utils/map";
import { VzIncidentListRow } from "@/types/vzIncidentList";

interface IncidentMapCardProps {
  incident: VzIncidentListRow;
}
/**
 * Map which displays the EMS incident location as well as nearby crashes and non-cr3s
 */
export default function IncidentMapCard({ incident }: IncidentMapCardProps) {
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
          savedLatitude={incident?.latitude || 0}
          savedLongitude={incident?.longitude || 0}
          mapRef={mapRef}
        ></PointMap>
      </Card.Body>
    </Card>
  );
}
