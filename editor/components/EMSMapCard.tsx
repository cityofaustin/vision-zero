import { useCallback, useMemo, useRef, useState } from "react";
import Card from "react-bootstrap/Card";
import { Layer, LayerProps, MapRef, Marker, Source } from "react-map-gl";
import { PointMap } from "@/components/PointMap";
import { useResizeObserver } from "@/utils/map";
import { PeopleListRow } from "@/types/peopleList";
import { Crash } from "@/types/crashes";
import { geoJsonTransformers } from "@/utils/map";
import { FaCarBurst } from "react-icons/fa6";
import { NonCR3Record } from "@/types/nonCr3";
import { MdOutlineStickyNote2 } from "react-icons/md";
import { CustomLayerToggle } from "@/components/MapBasemapControl";
import EMSIncidentMarker from "@/components/EMSMapMarker";

interface EMSMapCardProps {
  savedLatitude: number | null;
  savedLongitude: number | null;
  matchingPeople?: PeopleListRow[];
  nonCR3Crashes?: NonCR3Record[];
}

const crashLayerProps: LayerProps = {
  id: "crash-points",
  type: "circle",
  paint: {
    "circle-radius": [
      "interpolate",
      ["linear"],
      ["zoom"],
      // zoom is 5 (or less)
      5,
      10,
      // zoom is 20 (or greater)
      20,
      17,
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
      2,
    ],
    "circle-stroke-color": "#fff",
  },
};

const crashLabelLayerProps: LayerProps = {
  id: "crash-points-labels",
  type: "symbol",
  layout: {
    // "text-field": ["concat", "CR3 ", ["get", "record_locator"]],
    "text-field": ["get", "record_locator"],
    "text-font": ["Arial Unicode MS Bold"],
    "text-size": 16,
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

const nonCr3LayerProps: LayerProps = {
  id: "non-cr3-points",
  type: "circle",
  paint: {
    "circle-radius": [
      "interpolate",
      ["linear"],
      ["zoom"],
      // zoom is 5 (or less)
      5,
      10,
      // zoom is 20 (or greater)
      20,
      17,
    ],
    "circle-color": "#6b7676",
    "circle-stroke-width": [
      "interpolate",
      ["linear"],
      ["zoom"],
      // zoom is 5 (or less)
      5,
      1,
      // zoom is 20 (or greater)
      20,
      2,
    ],
    "circle-stroke-color": "#fff",
  },
};

const nonCr3LabelLayerProps: LayerProps = {
  id: "non-cr3-points-labels",
  type: "symbol",
  layout: {
    "text-field": ["concat", "", ["get", "case_id"]],
    "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
    "text-size": 14,
    "text-offset": [0, 1.5], // offset below the circle
    "text-anchor": "top",
    "text-allow-overlap": false, // prevents label collisions
  },
  paint: {
    "text-color": "#6b7676",
    "text-halo-color": "#fff",
    "text-halo-width": 1.5,
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

const useNonCR3Geojson = (nonCR3Crashes: NonCR3Record[] | undefined) =>
  useMemo(() => {
    if (!nonCR3Crashes) {
      return undefined;
    }
    return geoJsonTransformers.latLon(nonCR3Crashes);
  }, [nonCR3Crashes]);

const useLayerToggles = (
  showCrashes: boolean,
  showNoncr3Crashes: boolean,
  onToggleCrashes: () => void,
  onToggleNonCR3s: () => void
): CustomLayerToggle[] =>
  useMemo(() => {
    return [
      { label: "CR3 crashes", checked: showCrashes, onChange: onToggleCrashes },
      {
        label: "Non-CR3 crashes",
        checked: showNoncr3Crashes,
        onChange: onToggleNonCR3s,
      },
    ];
  }, [showCrashes, showNoncr3Crashes, onToggleCrashes, onToggleNonCR3s]);

/**
 * Card component that renders the crash map with no editing capabilities
 */
export default function EMSMapCard({
  savedLatitude,
  savedLongitude,
  matchingPeople,
  nonCR3Crashes,
}: EMSMapCardProps) {
  const mapRef = useRef<MapRef | null>(null);

  const [showCrashes, setShowCrashes] = useState(true);
  const onToggleCrashes = useCallback(
    () => setShowCrashes((prev) => !prev),
    []
  );

  const [showNonCr3s, setShowNonCr3s] = useState(true);
  const onToggleNonCr3s = useCallback(
    () => setShowNonCr3s((prev) => !prev),
    []
  );

  const customLayerToggles = useLayerToggles(
    showCrashes,
    showNonCr3s,
    onToggleCrashes,
    onToggleNonCr3s
  );

  /**
   * Trigger resize() when the map container size changes - this ensures that
   * the map repaints when the sidebar is collased/expanded.
   */
  const mapContainerRef = useResizeObserver<HTMLDivElement>(() => {
    mapRef.current?.resize();
  });

  const crashesGeojson = useCrashesGeojson(matchingPeople);
  const nonCR3Geojson = useNonCR3Geojson(nonCR3Crashes);

  return (
    <Card className="h-100">
      <Card.Body className="p-1 crash-header-card-body" ref={mapContainerRef}>
        <PointMap
          savedLatitude={savedLatitude}
          savedLongitude={savedLongitude}
          mapRef={mapRef}
          customLayerToggles={customLayerToggles}
          CustomMarker={EMSIncidentMarker}
        >
          {/* CR3 crash layers */}
          {showCrashes && crashesGeojson && (
            <Source id="cr3-crashes" type="geojson" data={crashesGeojson}>
              <Layer {...crashLayerProps} />
              <Layer {...crashLabelLayerProps} />
            </Source>
          )}
          {showCrashes &&
            crashesGeojson &&
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
                  <FaCarBurst size={22} color="#fff" />
                </div>
              </Marker>
            ))}
          {/* Non-CR3 crash layers */}
          {showNonCr3s && nonCR3Geojson && (
            <Source id="non-cr3-crashes" type="geojson" data={nonCR3Geojson}>
              <Layer {...nonCr3LayerProps} />
              <Layer {...nonCr3LabelLayerProps} />
            </Source>
          )}
          {showNonCr3s &&
            nonCR3Geojson &&
            nonCR3Geojson.features.map((feature) => (
              <Marker
                key={feature.properties?.case_id}
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
                  <MdOutlineStickyNote2 size={22} color="#fff" />
                </div>
              </Marker>
            ))}
        </PointMap>
      </Card.Body>
    </Card>
  );
}
