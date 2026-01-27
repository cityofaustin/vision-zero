import { useCallback, useMemo, useRef, useState } from "react";
import Card from "react-bootstrap/Card";
import { Layer, MapRef, Source } from "react-map-gl";
import { PointMap } from "@/components/PointMap";
import { useResizeObserver } from "@/utils/map";
import { PeopleListRow } from "@/types/peopleList";
import { Crash } from "@/types/crashes";
import { geoJsonTransformers } from "@/utils/map";
import { NonCR3Record } from "@/types/nonCr3";
import { CustomLayerToggle } from "@/components/MapBasemapControl";
import EMSIncidentMarker from "@/components/EMSMapMarker";
import NonCR3MapMarker from "@/components/NonCR3MapMarker";
import CrashMapMarker from "@/components/CrashMapMarker";
import { crashesLayerLabels } from "@/configs/crashesLayerLabels";
import { nonCr3LayerLabels } from "@/configs/nonCr3LayerLabels";
import AlignedLabel from "@/components/AlignedLabel";
import { FaCarBurst } from "react-icons/fa6";
import { ICON_MAP_MARKER_STYLES } from "@/configs/map";
import { MdOutlineStickyNote2 } from "react-icons/md";

interface EMSMapCardProps {
  savedLatitude: number | null;
  savedLongitude: number | null;
  matchingPeople?: PeopleListRow[];
  nonCR3Crashes?: NonCR3Record[];
}

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
      {
        id: "cr3_crashes",
        sectionHeader: (
          <div className="mb-1">
            <span className="fs-6 fw-bold">Crashes</span>
          </div>
        ),
        label: (
          <AlignedLabel>
            <span
              className="me-1"
              style={{
                ...ICON_MAP_MARKER_STYLES,
                height: 25,
                width: 25,
                border: "none",
                backgroundColor: "#1276d1",
                color: "#fff",
                cursor: "default",
              }}
            >
              <FaCarBurst className="fs-5" />
            </span>
            CR3
          </AlignedLabel>
        ),
        checked: showCrashes,
        onChange: onToggleCrashes,
      },
      {
        id: "noncr3_crashes",
        label: (
          <AlignedLabel>
            <span
              className="me-1"
              style={{
                ...ICON_MAP_MARKER_STYLES,
                height: 25,
                width: 25,
                border: "none",
                backgroundColor: "#6b7676",
                color: "#fff",
                cursor: "default",
              }}
            >
              <MdOutlineStickyNote2 className="fs-5" />
            </span>
            Non-CR3
          </AlignedLabel>
        ),
        checked: showNoncr3Crashes,
        onChange: onToggleNonCR3s,
      },
    ];
  }, [showCrashes, showNoncr3Crashes, onToggleCrashes, onToggleNonCR3s]);

/**
 * Map which displays the EMS incident location as well as nearby crashes and non-cr3s
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
   * the map repaints when the sidebar is collapsed/expanded.
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
              <Layer {...crashesLayerLabels} />
            </Source>
          )}
          {showCrashes &&
            crashesGeojson &&
            crashesGeojson.features.map((feature, i) => (
              <CrashMapMarker
                key={i}
                longitude={feature.geometry.coordinates[0]}
                latitude={feature.geometry.coordinates[1]}
                anchor="center"
              />
            ))}
          {/* Non-CR3 crash layers */}
          {showNonCr3s && nonCR3Geojson && (
            <Source id="non-cr3-crashes" type="geojson" data={nonCR3Geojson}>
              <Layer {...nonCr3LayerLabels} />
            </Source>
          )}
          {showNonCr3s &&
            nonCR3Geojson &&
            nonCR3Geojson.features.map((feature, i) => (
              <NonCR3MapMarker
                key={i}
                longitude={feature.geometry.coordinates[0]}
                latitude={feature.geometry.coordinates[1]}
                anchor="center"
              />
            ))}
          <EMSIncidentMarker
            latitude={savedLatitude || 0}
            longitude={savedLongitude || 0}
          />
        </PointMap>
      </Card.Body>
    </Card>
  );
}
