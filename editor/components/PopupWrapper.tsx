import { Popup } from "react-map-gl";

interface PopupWrapperProps {
  latitude: number;
  longitude: number;
  featureProperties: any;
  PopupContent: React.ComponentType;
  onClose: () => void;
}

export default function PopupWrapper({
  latitude,
  longitude,
  featureProperties,
  PopupContent,
  onClose,
}: PopupWrapperProps) {
  console.log(featureProperties);
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
