import React, { useCallback } from "react";
import Geocoder from "react-map-gl-geocoder";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { MAPBOX_TOKEN } from "../Map";
import { geocoderBbox } from "../mapData";

const MapGeocoder = React.forwardRef(({ handleViewportChange }, ref) => {
  const handleGeocoderViewportChange = useCallback(
    (viewport) => {
      // Speed up the transition flyTo transition
      const geocoderDefaultOverrides = {
        transitionDuration: 1500,
      };

      return handleViewportChange({
        ...viewport,
        ...geocoderDefaultOverrides,
      });
    },
    [handleViewportChange]
  );

  return (
    <Geocoder
      mapRef={ref}
      // containerRef={geocoderContainerRef}
      onViewportChange={handleGeocoderViewportChange}
      mapboxApiAccessToken={MAPBOX_TOKEN}
      position="top-left"
      marker={false}
      // Bounding box for auto-populated results in the search bar
      bbox={geocoderBbox}
    />
  );
});

export default MapGeocoder;
