import { useRef } from "react";
import Card from "react-bootstrap/Card";
import { MapRef } from "react-map-gl";
import { PointMap } from "@/components/PointMap";
import { useResizeObserver } from "@/utils/map";
import { VzIncidentListRow } from "@/types/vzIncidentList";
import IncidentMapMarker from "@/components/IncidentMapMarker";
import { BADGES } from "@/configs/badges";

const useIncidentMarkers = (incident: VzIncidentListRow) => {
  const markers = incident?.vz_incident_records_view
    ?.filter((record) => record.geom)
    .map((record) => {
      const name = ["apd", "ems", "afd"].includes(
        record.record_responding_agency || ""
      )
        ? record.record_responding_agency || ""
        : "crash_report";
      return (
        <IncidentMapMarker
          name={name}
          longitude={record.geom.coordinates[0]}
          latitude={record.geom.coordinates[1]}
        />
      );
    });
  return markers || [];
};

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

  const markers = useIncidentMarkers(incident);

  return (
    <Card className="h-100">
      <Card.Body className="p-1 crash-header-card-body" ref={mapContainerRef}>
        <PointMap
          savedLatitude={incident?.latitude || 0}
          savedLongitude={incident?.longitude || 0}
          mapRef={mapRef}
        >
          {...markers}
        </PointMap>
      </Card.Body>
    </Card>
  );
}
