import { useState } from "react";
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
  selectedFeatures,
  PopupContent,
  onClose,
}: PopupWrapperProps) {
  const selectedFeaturesLength = selectedFeatures.length
  console.log(selectedFeaturesLength)
  const [activeFeature, setActiveFeature] = useState(0);

  const handleNext = () => {
    if (activeFeature === selectedFeaturesLength -1) {
      setActiveFeature(0)
    }
    else {
      setActiveFeature(activeFeature+1)
    }
  }

  const handlePrevious = () => {
    if (activeFeature === 0) {
      setActiveFeature(selectedFeaturesLength-1)
    }
    else { 
      setActiveFeature(activeFeature -1)
    }
  }

  if (selectedFeaturesLength > 1) {
    return (
      <Popup
        latitude={latitude}
        longitude={longitude}
        // The popup won't render after multiple map feature click without this prop being false :/
        closeOnClick={false}
        onClose={onClose}
      >
        <PopupContent properties={selectedFeatures[activeFeature].properties} />
        <hr></hr>
        {activeFeature + 1}/{selectedFeaturesLength}
      </Popup>
    );
  }
  return (
    <Popup
      latitude={latitude}
      longitude={longitude}
      // The popup won't render after multiple map feature click without this prop being false :/
      closeOnClick={false}
      onClose={onClose}
    >
      <PopupContent properties={featureProperties} />
    </Popup>
  );
}
