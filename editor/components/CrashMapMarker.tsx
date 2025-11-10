import { Marker, MarkerProps } from "react-map-gl";
import { FaCarBurst } from "react-icons/fa6";

export default function CrashMapMarker(props: MarkerProps) {
  return (
    <Marker {...props} anchor="center">
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          backgroundColor: "#1276d1",
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
        <FaCarBurst size={22} color="#fff" />
      </div>
    </Marker>
  );
}
