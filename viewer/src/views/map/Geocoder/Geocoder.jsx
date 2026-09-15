import React, { useCallback } from "react";
import { useControl } from "react-map-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { geocoderBbox } from "../mapData";

/**
 * Geocoder component using react-map-gl's useControl hook
 * This is the recommended approach for v7
 */
const MapGeocoder = ({ handleViewportChange }) => {
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
    [handleViewportChange],
  );

  useControl(
    () => {
      return new MapboxGeocoder({
        accessToken: import.meta.env.VITE_MAPBOX_TOKEN,
        marker: false,
        bbox: geocoderBbox,
        placeholder: "Search for an address or place",
      });
    },
    ({ map }) => {
      const onResult = (event) => {
        const { result } = event;
        if (result && result.center) {
          // Using map's flyTo for smoother animation
          map.flyTo({
            center: [result.center[0], result.center[1]],
            zoom: 14,
            duration: 1500,
          });

          // Also update your React state
          handleGeocoderViewportChange({
            longitude: result.center[0],
            latitude: result.center[1],
            zoom: 14,
          });
        }
      };

      map.on("result", onResult);

      return () => {
        map.off("result", onResult);
      };
    },
    {
      position: "top-left",
    },
  );

  return null;
};

export default MapGeocoder;
