import { useState } from "react";
import { Popup } from "react-map-gl";
import { Button } from "react-bootstrap";
import { TableMapPopupContentProps } from "./TableMapPopupContent";
import { GeoJsonProperties } from "geojson";
import { LuSquareArrowLeft, LuSquareArrowRight } from "react-icons/lu";

interface PopupWrapperProps {
  latitude: number;
  longitude: number;
  selectedFeatures: GeoJsonProperties[];
  PopupContent: React.ComponentType<TableMapPopupContentProps>;
  onClose: () => void;
}

export default function PopupWrapper({
  latitude,
  longitude,
  selectedFeatures,
  PopupContent,
  onClose,
}: PopupWrapperProps) {
  const selectedFeaturesLength = selectedFeatures?.length;
  console.log(selectedFeaturesLength);
  const [activeFeature, setActiveFeature] = useState(0);

  const handleNext = () =>
    activeFeature === selectedFeaturesLength - 1
      ? setActiveFeature(0)
      : setActiveFeature(activeFeature + 1);

  const handlePrevious = () =>
    activeFeature === 0
      ? setActiveFeature(selectedFeaturesLength - 1)
      : setActiveFeature(activeFeature - 1);

  if (selectedFeaturesLength > 1) {
    return (
      <Popup
        latitude={latitude}
        longitude={longitude}
        // The popup won't render after multiple map feature click without this prop being false :/
        closeOnClick={false}
        onClose={onClose}
      >
        <PopupContent
          properties={selectedFeatures[activeFeature]?.properties}
        />
        <div className="d-flex align-items-center justify-content-between">
          <Button className="border-0" variant="link" onClick={handlePrevious}>
            <LuSquareArrowLeft className="text-muted" />
          </Button>{" "}
          <span>
            {activeFeature + 1}/{selectedFeaturesLength}
          </span>
          <Button className="border-0" variant="link" onClick={handleNext}>
            <LuSquareArrowRight className="text-muted" />
          </Button>{" "}
        </div>
      </Popup>
    );
  }

  /** Only one popup, display with no navigation */
  return (
    <Popup
      latitude={latitude}
      longitude={longitude}
      // The popup won't render after multiple map feature click without this prop being false :/
      closeOnClick={false}
      onClose={onClose}
    >
      <PopupContent properties={selectedFeatures[0]?.properties} />
    </Popup>
  );
}
