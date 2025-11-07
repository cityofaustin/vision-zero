import { useMemo, useRef } from "react";
import Card from "react-bootstrap/Card";
import { Layer, LayerProps, MapRef, Marker, Source } from "react-map-gl";
import { PointMap } from "@/components/PointMap";
import { useResizeObserver } from "@/utils/map";
import { PeopleListRow } from "@/types/peopleList";
import { Crash } from "@/types/crashes";
import { geoJsonTransformers } from "@/utils/map";
import { FaCarBurst } from "react-icons/fa6";

interface EMSMapCardProps {
  savedLatitude: number | null;
  savedLongitude: number | null;
  matchingPeople?: PeopleListRow[];
}

const crashLayerProps: LayerProps = {
  id: "points-layer",
  type: "circle",
  paint: {
    "circle-radius": [
      "interpolate",
      ["linear"],
      ["zoom"],
      // zoom is 5 (or less)
      5,
      5,
      // zoom is 20 (or greater)
      20,
      15,
    ],
    "circle-color": "#1276d1",
    "circle-stroke-width": [
      "interpolate",
      ["linear"],
      ["zoom"],
      // zoom is 5 (or less)
      5,
      1,
      // zoom is 20 (or greater)
      20,
      3,
    ],
    "circle-stroke-color": "#fff",
  },
};

const labelLayerProps: LayerProps = {
  id: "points-labels",
  type: "symbol",
  layout: {
    "text-field": ["concat", "CR3 - ", ["get", "record_locator"]],
    "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
    "text-size": 12,
    "text-offset": [0, 1.5], // offset below the circle
    "text-anchor": "top",
    "text-allow-overlap": false, // prevents label collisions
  },
  paint: {
    "text-color": "#1276d1",
    "text-halo-color": "#fff",
    "text-halo-width": 3,
  },
};

const useCrashesGeojson = (matchingPeople: PeopleListRow[] | undefined) =>
  useMemo(() => {
    if (!matchingPeople) {
      return undefined;
    }
    // Get a unique list of crashes from matching people
    const crashIdsFound: number[] = [];
    const crashes: Crash[] = [];
    matchingPeople.forEach((person) => {
      if (crashIdsFound.includes(person.crash_pk) || !person.crash) {
        return;
      }
      crashIdsFound.push(person.crash_pk);
      crashes.push(person.crash);
    });
    // Turn list of crashes into a geojson
    return geoJsonTransformers.latLon(crashes);
  }, [matchingPeople]);

/**
 * Card component that renders the crash map with no editing capabilities
 */
export default function EMSMapCard({
  savedLatitude,
  savedLongitude,
  matchingPeople,
}: EMSMapCardProps) {
  const mapRef = useRef<MapRef | null>(null);
  /**
   * Trigger resize() when the map container size changes - this ensures that
   * the map repaints when the sidebar is collased/expanded.
   */
  const mapContainerRef = useResizeObserver<HTMLDivElement>(() => {
    mapRef.current?.resize();
  });

  const crashesGeojson = useCrashesGeojson(matchingPeople);

  return (
    <Card className="h-100">
      <Card.Body className="p-1 crash-header-card-body" ref={mapContainerRef}>
        <PointMap
          savedLatitude={savedLatitude}
          savedLongitude={savedLongitude}
          mapRef={mapRef}
        >
          {crashesGeojson && (
            <Source id="custom-source" type="geojson" data={crashesGeojson}>
              <Layer {...crashLayerProps} />
              <Layer {...labelLayerProps} />
            </Source>
          )}
          {crashesGeojson &&
            crashesGeojson.features.map((feature) => (
              <Marker
                key={feature.properties?.id}
                longitude={feature.geometry.coordinates[0]}
                latitude={feature.geometry.coordinates[1]}
                anchor="center"
              >
                <div
                  style={{
                    transform: "translate(0%,-7%)",
                    pointerEvents: "none",
                  }}
                >
                  <FaCarBurst size={16} color="#fff" />
                </div>
              </Marker>
            ))}
        </PointMap>
      </Card.Body>
    </Card>
  );
}
