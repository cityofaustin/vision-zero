import { Marker, MarkerProps } from "react-map-gl";
import { FaCarBurst } from "react-icons/fa6";
import { ICON_MAP_MARKER_STYLES } from "@/configs/map";
import { BADGES } from "@/configs/badges";

type IncidentMapMarkerProps = MarkerProps & {
  name: keyof typeof BADGES;
};

export default function IncidentMapMarker({
  name,
  ...props
}: IncidentMapMarkerProps) {
  const { icon: Icon, ...badgeStyles } = BADGES[name];
  return (
    <Marker {...props} anchor="center">
      <div
        style={{
          ...ICON_MAP_MARKER_STYLES,
          ...badgeStyles,
          pointerEvents: "none",
        }}
      >
        <Icon size={22} />
      </div>
    </Marker>
  );
}
