import { useEffect, useState } from "react";
import { Popup } from "react-map-gl";
import { Button } from "react-bootstrap";
import { GeoJsonProperties } from "geojson";
import { LuArrowLeft, LuArrowRight } from "react-icons/lu";
import { TableMapPopupContentProps } from "./TableMapPopupContent";
import AlignedLabel from "@/components/AlignedLabel";

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

  return (
    <Popup
      latitude={latitude}
      longitude={longitude}
      // The popup won't render after multiple map feature click without this prop being false :/
      closeOnClick={false}
      onClose={onClose}
      style={{ width: "235px" }}
    >
      <PopupContent
        properties={selectedFeatures[activeFeatureIndex]?.properties}
      />
      {selectedFeaturesLength > 1 && (
        <div className="d-flex align-items-center justify-content-between border-top pt-2 mx-2">
          <Button
            size="sm"
            className="px-0 me-2 px-1"
            variant="outline-primary"
            onClick={handlePrevious}
          >
            <AlignedLabel>
              <LuArrowLeft className="fs-6" />
            </AlignedLabel>
          </Button>
          <span className="text-primary">
            {activeFeatureIndex + 1} of {selectedFeaturesLength}
          </span>
          <Button
            size="sm"
            className=" px-0 px-1"
            variant="outline-primary"
            onClick={handleNext}
          >
            <AlignedLabel>
              <LuArrowRight className="fs-6" />
            </AlignedLabel>
          </Button>
        </div>
      )}
    </Popup>
  );
}
