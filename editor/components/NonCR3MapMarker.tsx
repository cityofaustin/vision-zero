import { Marker, MarkerProps } from "react-map-gl";
import { MdOutlineStickyNote2 } from "react-icons/md";

export default function NonCR3MapMarker(props: MarkerProps) {
  return (
    <Marker {...props} anchor="center">
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          backgroundColor: "#6b7676",
          border: "1.5px solid #fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          pointerEvents: "none",
          position: "relative",
          zIndex: 10,
        }}
      >
        <MdOutlineStickyNote2 size={22} color="#fff" />
      </div>
    </Marker>
  );
}
