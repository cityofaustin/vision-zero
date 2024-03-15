import React from "react";
import MapGL, {
  Marker,
  NavigationControl,
  FullscreenControl,
} from "react-map-gl";
import Pin from "./Pin";
import {
  defaultInitialState,
  LabeledAerialSourceAndLayer,
  mapParameters,
} from "../../../helpers/map";
import { isDev } from "../../../helpers/environment";
import "mapbox-gl/dist/mapbox-gl.css";

const CrashMap = ({ data }) => {
  const { latitude_primary = null, longitude_primary = null } = data;

  return (
    <MapGL
      initialViewState={{
        latitude: latitude_primary || defaultInitialState.latitude,
        longitude: longitude_primary || defaultInitialState.longitude,
        zoom: defaultInitialState.zoom,
      }}
      style={{ width: "100%", height: "100%" }}
      {...mapParameters}
      cooperativeGestures={true}
    >
      <FullscreenControl position="top-left" />
      <NavigationControl position="top-left" showCompass={false} />
      <Marker latitude={latitude_primary} longitude={longitude_primary}>
        <Pin size={40} color={"warning"} />
      </Marker>
      {/* add nearmap raster source and style */}
      {!isDev && <LabeledAerialSourceAndLayer />}
    </MapGL>
  );
};

export default CrashMap;
