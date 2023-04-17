// TODO Geocoder in the top left
// TODO Type street into search bar
// TODO dropdown autocomplete of streets
// TODO zoom to location
// TODO clear search input
import React from "react";
import Geocoder from "react-map-gl-geocoder";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { MAPBOX_TOKEN } from "../Map";

const MapGeocoder = React.forwardRef(({ handleViewportChange }, ref) => {
  return (
    <Geocoder
      mapRef={ref}
      onViewportChange={handleViewportChange}
      mapboxApiAccessToken={MAPBOX_TOKEN}
      //   inputValue={geocoderAddress}
      options={{ flyTo: false }}
      position="top-left"
      // Bounding box for auto-populated results in the search bar
      //   bbox={[-98.22464, 29.959694, -97.226257, 30.687526]}
    />
  );
});

export default MapGeocoder;
