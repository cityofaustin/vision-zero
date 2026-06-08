import { useMemo, useRef } from "react";
import Card from "react-bootstrap/Card";
import { Layer, LayerProps, MapRef, Source } from "react-map-gl";
import { PointMap } from "@/components/PointMap";
import { useResizeObserver } from "@/utils/map";
import { geoJsonTransformers } from "@/utils/map";
import { CadIncident } from "@/types/cadIncident";
import CrashMapMarker from "@/components/CrashMapMarker";

interface IncidentMapCardProps {
  cadIncidents: CadIncident[];
}

const useCadGeojson = (cadIncidents: CadIncident[] | undefined) =>
  useMemo(() => {
    if (!cadIncidents) {
      return undefined;
    }

    // Turn list of crashes into a geojson
    return geoJsonTransformers.latLon(cadIncidents);
  }, [cadIncidents]);

const cadLayerLabels: LayerProps = {
  id: "cad-points-labels",
  type: "symbol",
  layout: {
    // "text-field": ["concat", "CR3 ", ["get", "record_locator"]],
    "text-field": ["get", "incident_number"],
    "text-font": ["Arial Unicode MS Bold"],
    "text-size": 18,
    "text-offset": [0, 1.5], // offset below the circle
    "text-anchor": "top",
    "text-allow-overlap": false, // prevents label collisions
  },
  paint: {
    "text-color": "#1276d1",
    "text-halo-color": "#fff",
    "text-halo-width": 1.5,
  },
};

/**
 * Map which displays the EMS incident location as well as nearby crashes and non-cr3s
 */
export default function IncidentMapCard({
  cadIncidents,
}: IncidentMapCardProps) {
  const mapRef = useRef<MapRef | null>(null);

  /**
   * Trigger resize() when the map container size changes - this ensures that
   * the map repaints when the sidebar is collapsed/expanded.
   */
  const mapContainerRef = useResizeObserver<HTMLDivElement>(() => {
    mapRef.current?.resize();
  });

  const cadGeojson = useCadGeojson(cadIncidents);

  return (
    <Card className="h-100">
      <Card.Body className="p-1 crash-header-card-body" ref={mapContainerRef}>
        <PointMap
          savedLatitude={cadIncidents?.[0].latitude || 0}
          savedLongitude={cadIncidents?.[0].longitude || 0}
          mapRef={mapRef}
        >
          {cadGeojson?.features.map((feature, i) => (
            <CrashMapMarker
              key={i}
              longitude={feature.geometry.coordinates[0]}
              latitude={feature.geometry.coordinates[1]}
              anchor="center"
            />
          ))}

          {/* {cadGeojson && (
            <Source id="cad-incidents" type="geojson" data={cadGeojson}>
              <Layer {...cadLayerLabels} />
            </Source>
          )} */}
        </PointMap>
      </Card.Body>
    </Card>
  );
}
