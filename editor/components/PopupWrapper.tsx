import { Popup } from "react-map-gl";
import { TableMapPopupContentProps } from "./TableMapPopupContent";
import { GeoJsonProperties } from "geojson";

interface PopupWrapperProps {
  latitude: number;
  longitude: number;
  featureProperties: GeoJsonProperties;
  PopupContent: React.ComponentType<TableMapPopupContentProps>;
  onClose: () => void;
}

export default function PopupWrapper({
  latitude,
  longitude,
  featureProperties,
  PopupContent,
  onClose,
}: PopupWrapperProps) {
  return (
    <Popup
      latitude={latitude}
      longitude={longitude}
      closeOnClick={false}
      onClose={onClose}
    >
      <PopupContent properties={featureProperties} />
    </Popup>
  );
}
