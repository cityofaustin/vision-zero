import { useMemo, useRef } from "react";
import Card from "react-bootstrap/Card";
import { Layer, LayerProps, MapRef, Source } from "react-map-gl";
import { PointMap } from "@/components/PointMap";
import { useResizeObserver } from "@/utils/map";
import { PeopleListRow } from "@/types/peopleList";
import { Crash } from "@/types/crashes";
import { geoJsonTransformers } from "@/types/tableMapConfig";
import { crashesListViewQueryConfig } from "@/configs/crashesListViewTable";

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
      2,
      // zoom is 20 (or greater)
      20,
      10,
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
    "text-field": ["get", "record_locator"], // or whatever property contains your label text
    "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
    "text-size": 12,
    "text-offset": [0, 1.5], // offset below the circle
    "text-anchor": "top",
    "text-allow-overlap": false, // prevents label collisions
  },
  paint: {
    "text-color": "#000",
    "text-halo-color": "#fff",
    "text-halo-width": 2,
  },
};

const useCrashesGeojson = (matchingPeople: PeopleListRow[] | undefined) =>
  useMemo(() => {
    if (!matchingPeople) {
      return undefined;
    }
    // Get a unique list of crashes from matching people
    const crashIdsFound: Number[] = [];
    const crashes: Crash[] = [];
    matchingPeople.forEach((person) => {
      if (crashIdsFound.includes(person.crash_pk) || !person.crash) {
        return;
      }
      crashIdsFound.push(person.crash_pk);
      crashes.push(person.crash);
      person.crash;
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
          {" "}
          <Source id="custom-source" type="geojson" data={crashesGeojson}>
            <Layer {...crashLayerProps} />
            <Layer {...labelLayerProps} />
          </Source>
        </PointMap>
      </Card.Body>
    </Card>
  );
}
