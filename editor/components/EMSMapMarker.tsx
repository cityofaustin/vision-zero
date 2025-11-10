import { Marker, MarkerProps } from "react-map-gl";
import { FaTruckMedical } from "react-icons/fa6";
import { ICON_MAP_MARKER_STYLES } from "@/configs/map";

export default function EMSIncidentMarker(props: MarkerProps) {
  return (
    <Marker {...props} anchor="center">
      <div
        className="icon-map-marker"
        style={{
          ...ICON_MAP_MARKER_STYLES,
          backgroundColor: "#dd0426",
          pointerEvents: "none",
        }}
      >
        <FaTruckMedical size={20} color="#fff" />
      </div>
    </Marker>
  );
}
