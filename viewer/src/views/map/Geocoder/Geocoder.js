import React, { useCallback } from "react";
import Geocoder from "react-map-gl-geocoder";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { MAPBOX_TOKEN } from "../Map";
import { geocoderBbox } from "../mapData";

/**
 * Geocoder component for the map with forwarded map ref
 * Important: all prop objects or function must be memoized for the geocoder
 * dropdown to close after selecting a result.
 * @see https://github.com/SamSamskies/react-map-gl-geocoder/issues/96
 * @param {Function} handleViewportChange - Callback function to update the map viewport
 */
const MapGeocoder = React.forwardRef(({ handleViewportChange }, ref) => {
  const handleGeocoderViewportChange = useCallback(
    (viewport) => {
      // Speed up the flyTo transition
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
