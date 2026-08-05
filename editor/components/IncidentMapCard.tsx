import { useRef } from "react";
import Card from "react-bootstrap/Card";
import { MapRef } from "react-map-gl";
import { PointMap } from "@/components/PointMap";
import { useResizeObserver } from "@/utils/map";
import { VzIncidentListRow } from "@/types/vzIncidentList";
import IncidentMapMarker from "@/components/IncidentMapMarker";
import { RECORD_TYPE_BADGES } from "@/components/RecordTypeBadge";

/**
 * Hook which returns a map marker for each record that the incident
 * is comprised of
 */
const useIncidentMarkers = (incident: VzIncidentListRow) => {
  const markers = incident?.vz_incident_records_view
    ?.filter((record) => record.geom)
    .map((record, i) => {
      /**
       * Defaut to the "crashes" marker and use the appropriate
       *  apd/ems/afd badge
       */
      let name: keyof typeof RECORD_TYPE_BADGES = "crashes";
      if (
        (record.record_responding_agency === "apd" &&
          record.record_table_name !== "crashes") ||
        record.record_responding_agency === "ems" ||
        record.record_responding_agency === "afd"
      ) {
        /**
         * This path covers afd__incidents, ems__incidents, and cad_incidents
         */
        name = record.record_responding_agency;
      }
      return (
        <IncidentMapMarker
          key={i}
          id={String(i)}
          name={name}
          longitude={record.geom?.coordinates[0] ?? 0}
          latitude={record.geom?.coordinates[1] ?? 0}
        />
      );
    });
  return markers || [];
};

interface IncidentMapCardProps {
  incident: VzIncidentListRow;
}
/**
 * Map which displays the VZ incident location
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
          autoFitBounds
          savedLatitude={null}
          savedLongitude={null}
          mapRef={mapRef}
        >
          {...markers}
        </PointMap>
      </Card.Body>
    </Card>
  );
}
