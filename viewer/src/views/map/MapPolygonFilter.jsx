import React, { useRef, useCallback, useEffect, useState } from "react";
import { useMap, Source, Layer } from "react-map-gl/mapbox";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { stringify as stringifyGeoJSON } from "wellknown";
import { mapboxDrawStyles } from "./helpers";
import {
  selectedPolygonDataLayer,
  selectedPolygonOutlineDataLayer,
} from "./map-style";

// mapbox-gl-draw's touch handling calls preventDefault() on every tap on
// the map for as long as its control is attached (regardless of mode),
// which silently blocks the tap-to-click behavior the crash popups rely
// on. To avoid breaking popups on touch devices, the control is only
// attached to the map while the user is actively drawing a polygon, and
// removed again the moment drawing finishes or is cancelled.

const MapPolygonFilter = ({ setMapPolygon, onDrawingChange }) => {
  const { current: map } = useMap();
  const drawRef = useRef(null);
  const isMounted = useRef(true);
  const eventHandlersRef = useRef([]);

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnFeature, setDrawnFeature] = useState(null);

  // Let the parent map know when polygon drawing starts/stops so it can
  // suppress other click-driven popups (e.g. crash/council district) that
  // would otherwise pop up mid-draw.
  useEffect(() => {
    onDrawingChange?.(isDrawing);
  }, [isDrawing, onDrawingChange]);

  // Detach the draw control from the map and reset its internal state.
  // Safe to call whether or not the control is currently attached.
  const detachDraw = useCallback(() => {
    const draw = drawRef.current;
    if (!draw || !map) return;
    try {
      draw.deleteAll();
      if (map.hasControl(draw)) {
        map.removeControl(draw);
      }
    } catch (error) {
      console.debug("Draw detach error:", error.message);
    }
  }, [map]);

  // Cleanup draw control and its listeners
  const cleanupDraw = useCallback(() => {
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
  }, [map]);

  // Component unmount cleanup
  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
      cleanupDraw();
    };
  }, [cleanupDraw]);

  // Initialize draw control (not yet attached to the map) and listeners
  useEffect(() => {
    if (!map || !isMounted.current) {
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
        if (!isMounted.current) return;

        try {
          const feature = event.features && event.features[0];
          if (
            feature &&
            feature.geometry &&
            feature.geometry.type === "Polygon"
          ) {
            const wkt = stringifyGeoJSON(feature);
            setMapPolygon(wkt);
            setDrawnFeature(feature);
          }
        } catch (error) {
          console.error("Failed to process drawn polygon:", error);
        }

        // Returning to simple_select fires draw.modechange, which detaches
        // the control below - keeping the "leave idle -> detach" logic in
        // one place regardless of how drawing ends.
        try {
          draw.changeMode("simple_select");
        } catch (error) {
          console.debug("Draw mode change error:", error);
        }
      };

      const handleModeChange = ({ mode }) => {
        if (!isMounted.current) return;

        // Covers our own "cancel" button as well as mapbox-gl-draw's own
        // internal cancellation (e.g. the Escape key), so the control
        // never stays attached once drawing stops.
        if (mode === "simple_select") {
          setIsDrawing(false);
          detachDraw();
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
  }, [map, cleanupDraw, detachDraw, setMapPolygon]);

  const handleStartDraw = useCallback(() => {
    const draw = drawRef.current;
    if (!map || !draw) return;

    try {
      if (!map.hasControl(draw)) {
        map.addControl(draw, "top-right");
      }
      draw.changeMode("draw_polygon");
      setIsDrawing(true);
    } catch (error) {
      console.debug("Start draw error:", error);
    }
  }, [map]);

  const handleCancelDraw = useCallback(() => {
    const draw = drawRef.current;
    if (!draw) return;

    try {
      // draw_polygon's onStop (run by changeMode) tries to salvage the
      // in-progress shape into a finished polygon if it already has
      // enough vertices to be valid, firing draw.create instead of
      // discarding it. trash() runs draw_polygon's onTrash instead, which
      // unconditionally deletes the in-progress feature before switching
      // modes - a true cancel regardless of vertex count.
      // Triggers draw.modechange -> detachDraw()
      draw.trash();
    } catch (error) {
      console.debug("Cancel draw error:", error);
      detachDraw();
      setIsDrawing(false);
    }
  }, [detachDraw]);

  const handleClearPolygon = useCallback(() => {
    detachDraw();
    if (isMounted.current) {
      setDrawnFeature(null);
    }
    setMapPolygon(null);
  }, [detachDraw, setMapPolygon]);

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
            className="mapbox-gl-draw_ctrl-draw-btn mapbox-gl-draw_trash"
            type="button"
            aria-label="Clear polygon filter"
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
