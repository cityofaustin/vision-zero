import { Marker, MarkerProps } from "react-map-gl";
import { FaTruckMedical } from "react-icons/fa6";

export default function EMSIncidentMarker(props: MarkerProps) {
  return (
    <Marker {...props} anchor="center">
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          backgroundColor: "#dd0426",
          border: "1.5px solid #fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          pointerEvents: "none",
        }}
      >
        <FaTruckMedical
          size={20}
          color="#fff"
          //   style={{ transform: "translate(0%,-7%)" }}
        />
      </div>
    </Marker>
  );
}
