import React from "react";
import Geocoder from "react-map-gl-geocoder";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { MAPBOX_TOKEN } from "../Map";
import { mapNavBbox } from "../mapData";

const MapGeocoder = React.forwardRef(({ handleViewportChange }, ref) => {
  // Apply the same map navigation bounding box to the geocoder search
  const { latitude, longitude } = mapNavBbox;
  const bbox = [longitude.min, latitude.min, longitude.max, latitude.max];

  return (
    <Geocoder
      mapRef={ref}
      onViewportChange={handleViewportChange}
      mapboxApiAccessToken={MAPBOX_TOKEN}
      options={{ flyTo: false }}
      position="top-left"
      // Bounding box for auto-populated results in the search bar
      bbox={bbox}
    />
  );
});

export default MapGeocoder;
