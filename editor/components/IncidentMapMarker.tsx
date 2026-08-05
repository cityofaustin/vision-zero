import { Marker, MarkerProps } from "react-map-gl";
import { ICON_MAP_MARKER_STYLES } from "@/configs/map";
import { useRegisterMapFeature } from "@/contexts/MapFeatureRegistry";
import { RECORD_TYPE_BADGES } from "@/components/RecordTypeBadge";

type IncidentMapMarkerProps = MarkerProps & {
  id: string;
  name: keyof typeof RECORD_TYPE_BADGES;
};

export default function IncidentMapMarker({
  id,
  name,
  latitude,
  longitude,
  ...props
}: IncidentMapMarkerProps) {
  useRegisterMapFeature(id, { latitude, longitude });
  const { icon: Icon, iconStyle } = RECORD_TYPE_BADGES[name];

  // Use badge color as background color
  const markerStyle = {
    backgroundColor: iconStyle.color,
    color: "#fff",
  };

  return (
    <Marker
      {...props}
      latitude={latitude}
      longitude={longitude}
      anchor="center"
    >
      <div
        style={{
          ...ICON_MAP_MARKER_STYLES,
          ...markerStyle,
          pointerEvents: "none",
        }}
      >
        <Icon size={22} />
      </div>
    </Marker>
  );
}
