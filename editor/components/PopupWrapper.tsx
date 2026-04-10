import { useEffect, useState } from "react";
import { Popup } from "react-map-gl";
import { Button } from "react-bootstrap";
import { TableMapPopupContentProps } from "./TableMapPopupContent";
import { GeoJsonProperties } from "geojson";
import { LuSquareArrowLeft, LuSquareArrowRight } from "react-icons/lu";
import { COLORS } from "@/utils/constants";

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
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);

  const handleNext = () =>
    activeFeatureIndex === selectedFeaturesLength - 1
      ? setActiveFeatureIndex(0)
      : setActiveFeatureIndex(activeFeatureIndex + 1);

  const handlePrevious = () =>
    activeFeatureIndex === 0
      ? setActiveFeatureIndex(selectedFeaturesLength - 1)
      : setActiveFeatureIndex(activeFeatureIndex - 1);

  // reset popup active feature to first element if viewing new array of popups
  useEffect(() => {
    setActiveFeatureIndex(0);
  }, [selectedFeatures]);

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
          properties={selectedFeatures[activeFeatureIndex]?.properties}
        />
        <div className="d-flex align-items-center justify-content-between border-top m-2">
          <Button
            className="border-0 px-0"
            variant="link"
            onClick={handlePrevious}
          >
            <LuSquareArrowLeft color={COLORS.primary} />
          </Button>{" "}
          <span>
            {activeFeatureIndex + 1}/{selectedFeaturesLength}
          </span>
          <Button className="border-0 px-0" variant="link" onClick={handleNext}>
            <LuSquareArrowRight color={COLORS.primary} />
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
