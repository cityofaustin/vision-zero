import { Marker, MarkerProps } from "react-map-gl";
import { FaCarBurst } from "react-icons/fa6";
import { ICON_MAP_MARKER_STYLES } from "@/configs/map";

export default function CrashMapMarker(props: MarkerProps) {
  return (
    <Marker {...props} anchor="center">
      <div
        style={{
          ...ICON_MAP_MARKER_STYLES,
          backgroundColor: "#1276d1",
          pointerEvents: "none",
        }}
      >
        <FaCarBurst size={22} color="#fff" />
      </div>
    </Marker>
  );
}
