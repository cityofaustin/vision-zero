import { Marker, MarkerProps } from "react-map-gl";
import { MdOutlineStickyNote2 } from "react-icons/md";
import { ICON_MAP_MARKER_STYLES } from "@/configs/map";

export default function NonCR3MapMarker(props: MarkerProps) {
  return (
    <Marker {...props} anchor="center">
      <div
        className="icon-map-marker"
        style={{
          ...ICON_MAP_MARKER_STYLES,
          backgroundColor: "#6b7676",
          pointerEvents: "none",
        }}
      >
        <MdOutlineStickyNote2 size={22} color="#fff" />
      </div>
    </Marker>
  );
}
