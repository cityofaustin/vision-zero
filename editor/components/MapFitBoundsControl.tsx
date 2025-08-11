import { MutableRefObject } from "react";
import Button from "react-bootstrap/Button";
import AlignedLabel from "@/components/AlignedLabel";
import { FaHome } from "react-icons/fa";
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
    <Button
      size="lg"
      className="button-map-control m-2 px-2 rounded"
      variant="primary"
      style={{
        position: "absolute",
        cursor: "pointer",
      }}
      onClick={() => {
        if (bounds) {
          mapRef?.current?.fitBounds(bounds, { padding: 10 });
        }
      }}
    >
      <AlignedLabel>
        <FaHome className="fs-4" />
      </AlignedLabel>
    </Button>
  );
}
