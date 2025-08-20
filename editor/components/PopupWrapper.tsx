import { Popup } from "react-map-gl";
import Link from "next/link";

interface PopupWrapperProps {
  latitude: number;
  longitude: number;
  featureProperties: any;
  PopupContent: React.ComponentType;
}

export default function PopupWrapper({
  latitude,
  longitude,
  featureProperties,
  PopupContent,
}: PopupWrapperProps) {
  console.log(featureProperties);
  return (
    <Popup latitude={latitude} longitude={longitude}>
      <PopupContent properties={featureProperties} />
    </Popup>
  );
}
