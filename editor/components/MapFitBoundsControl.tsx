import { MutableRefObject } from "react";
import Button from "react-bootstrap/Button";
import AlignedLabel from "@/components/AlignedLabel";
import { MdFilterCenterFocus } from "react-icons/md";
import { MapRef } from "react-map-gl";
import { LngLatBoundsLike } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

/**
 * Custom map control that fits the map to current bounds
 */
export default function MapFitBoundsControl({
  mapRef,
  bounds,
}: {
  mapRef: MutableRefObject<MapRef | null>;
  bounds: LngLatBoundsLike | undefined;
}) {
  return (
    <div className="map-custom-ctrl-container-top-right">
      <Button
        size="lg"
        className="map-custom-ctrl-btn"
        variant="primary"
        onClick={() => {
          if (bounds) {
            mapRef?.current?.fitBounds(bounds, { padding: 10 });
          }
        }}
      >
        <AlignedLabel>
          <MdFilterCenterFocus />
        </AlignedLabel>
      </Button>
    </div>
  );
}
