import React, { useRef, useCallback, useEffect, useMemo } from "react";
import { useMap, Source, Layer } from "react-map-gl/mapbox";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { stringify as stringifyGeoJSON, parse as parseWKT } from "wellknown";
import { mapboxDrawStyles } from "./helpers";
import {
  selectedPolygonDataLayer,
  selectedPolygonOutlineDataLayer,
} from "./map-style";

/**
 * Component which handles polygon drawing + filtering.
 *
 * Mapbox-gl-draw's touch handling calls preventDefault() on every tap on
 * the map for as long as its control is attached (regardless of mode),
 * which silently blocks the tap-to-click behavior the crash popups rely
 * on. To avoid breaking popups on touch devices, the control is only
 * attached to the map while the user is actively drawing a polygon.
 **/
const MapPolygonFilter = ({
  mapPolygon,
  setMapPolygon,
  isDrawing,
  setIsDrawing,
}) => {
  const { current: map } = useMap();
  const drawRef = useRef(null);
  const eventHandlersRef = useRef([]);
  const detachTimeoutRef = useRef(null);
  const drawnFeature = useMemo(() => {
    if (!mapPolygon) return null;
    const geometry = parseWKT(mapPolygon);
    return geometry ? { type: "Feature", geometry, properties: {} } : null;
  }, [mapPolygon]);

  const cancelPendingDetach = useCallback(() => {
    if (detachTimeoutRef.current !== null) {
      clearTimeout(detachTimeoutRef.current);
      detachTimeoutRef.current = null;
    }
  }, []);

  // Detach the draw control from the map and clear its internal features.
  // Safe to call whether or not the control is currently attached.
  const detachDraw = useCallback(() => {
    const draw = drawRef.current;
    if (!draw || !map) return;
    try {
      // Only touch Draw's API while attached: once removed, its internal
      // store is null and API calls like deleteAll() would throw.
      if (map.hasControl(draw)) {
        draw.deleteAll();
        map.removeControl(draw);
      }
    } catch (error) {
      console.debug("Draw detach error:", error.message);
    }
  }, [map]);

  // Detach on the next tick rather than synchronously. draw.modechange is
  // fired partway through Draw's own mode transition, and Draw continues
  // using its internal store after the event returns. Removing the control
  // inside the handler nulls that store and makes Draw throw.
  const scheduleDetach = useCallback(() => {
    cancelPendingDetach();
    detachTimeoutRef.current = setTimeout(() => {
      detachTimeoutRef.current = null;
      const draw = drawRef.current;
      if (!draw || !map) return;
      // If the user started a new drawing within the same tick, leave it be.
      if (map.hasControl(draw) && draw.getMode() !== "simple_select") return;
      detachDraw();
    }, 0);
  }, [map, detachDraw, cancelPendingDetach]);

  // Full teardown: listeners, pending detach, and the control itself.
  const cleanupDraw = useCallback(() => {
    cancelPendingDetach();
    if (map) {
      try {
        eventHandlersRef.current.forEach(({ event, handler }) => {
          try {
            map.off(event, handler);
          } catch (e) {
            console.error(e);
          }
        });
        eventHandlersRef.current = [];

        if (drawRef.current && map.hasControl(drawRef.current)) {
          map.removeControl(drawRef.current);
        }
      } catch (error) {
        console.debug("Draw cleanup error:", error.message);
      }
    }
    drawRef.current = null;
  }, [map, cancelPendingDetach]);

  // Create the Draw instance (not yet attached to the map) and register
  // listeners on the map. Listeners persist across attach/detach cycles.
  // The returned cleanup also covers component unmount.
  useEffect(() => {
    if (!map) {
      console.debug("Map not ready for DrawControl");
      return;
    }

    cleanupDraw();

    try {
      const draw = new MapboxDraw({
        // No built-in toolbar - custom buttons below drive the control,
        // so it can be added/removed from the map on demand.
        displayControlsDefault: false,
        controls: {},
        defaultMode: "simple_select",
        styles: mapboxDrawStyles,
      });
      drawRef.current = draw;

      const handleCreate = (event) => {
        // Fired from inside draw_polygon's onStop while Draw is already
        // transitioning to simple_select, so no mode change is needed
        // (or safe) here - draw.modechange follows and handles detaching.
        try {
          const feature = event.features && event.features[0];
          if (
            feature &&
            feature.geometry &&
            feature.geometry.type === "Polygon"
          ) {
            setMapPolygon(stringifyGeoJSON(feature));
          }
        } catch (error) {
          console.error("Failed to process drawn polygon:", error);
        }
      };

      const handleModeChange = ({ mode }) => {
        // Covers finishing a polygon, our cancel button (trash()), and
        // Draw's own cancellation (e.g. the Escape key).
        if (mode === "simple_select") {
          setIsDrawing(false);
          scheduleDetach();
        } else {
          setIsDrawing(true);
        }
      };

      map.on("draw.create", handleCreate);
      map.on("draw.modechange", handleModeChange);

      eventHandlersRef.current = [
        { event: "draw.create", handler: handleCreate },
        { event: "draw.modechange", handler: handleModeChange },
      ];

      return () => {
        cleanupDraw();
      };
    } catch (error) {
      console.error("Failed to initialize draw control:", error);
      return cleanupDraw;
    }
  }, [map, cleanupDraw, scheduleDetach, setIsDrawing, setMapPolygon]);

  const handleStartDraw = useCallback(() => {
    const draw = drawRef.current;
    if (!map || !draw) return;

    // A detach may still be queued from a previous drawing session.
    cancelPendingDetach();

    try {
      if (!map.hasControl(draw)) {
        map.addControl(draw, "top-right");
      }
      // Silent via the public API - no draw.modechange, so set state here.
      draw.changeMode("draw_polygon");
      setIsDrawing(true);
    } catch (error) {
      console.debug("Start draw error:", error);
    }
  }, [map, setIsDrawing, cancelPendingDetach]);

  const handleCancelDraw = useCallback(() => {
    const draw = drawRef.current;
    if (!draw) return;

    try {
      // changeMode() would run draw_polygon's onStop, which salvages an
      // in-progress shape with enough vertices into a finished polygon
      // (firing draw.create). trash() runs onTrash instead, which always
      // deletes the in-progress feature and then switches to simple_select
      // internally - firing draw.modechange -> scheduleDetach().
      draw.trash();
    } catch (error) {
      console.debug("Cancel draw error:", error);
      detachDraw();
      setIsDrawing(false);
    }
  }, [detachDraw, setIsDrawing]);

  const handleClearPolygon = useCallback(() => {
    cancelPendingDetach();
    detachDraw();
    setMapPolygon(null);
  }, [detachDraw, setMapPolygon, cancelPendingDetach]);

  return (
    <>
      {drawnFeature && (
        <Source id="selectedPolygon" type="geojson" data={drawnFeature}>
          <Layer {...selectedPolygonDataLayer} />
          <Layer {...selectedPolygonOutlineDataLayer} />
        </Source>
      )}
      <div className="polygon-filter-control mapboxgl-ctrl mapboxgl-ctrl-group">
        {isDrawing ? (
          <button
            type="button"
            aria-label="Cancel drawing polygon filter"
            className="mapbox-gl-draw_ctrl-draw-btn mapbox-gl-draw_trash"
            onClick={handleCancelDraw}
          />
        ) : drawnFeature ? (
          <button
            type="button"
            aria-label="Clear polygon filter"
            className="mapbox-gl-draw_ctrl-draw-btn mapbox-gl-draw_trash"
            onClick={handleClearPolygon}
          />
        ) : (
          <button
            type="button"
            aria-label="Draw polygon filter"
            className="mapbox-gl-draw_ctrl-draw-btn mapbox-gl-draw_polygon"
            onClick={handleStartDraw}
          />
        )}
      </div>
    </>
  );
};

export default MapPolygonFilter;
