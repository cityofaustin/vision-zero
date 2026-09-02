import React, { useState, useRef, useCallback, useEffect } from "react";
import { useMap } from "react-map-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { stringify as stringifyGeoJSON } from "wellknown";
import { mapboxDrawStyles } from "./helpers";

const MapPolygonFilter = ({ setMapPolygon }) => {
  const { current: map } = useMap();
  const drawRef = useRef(null);
  const [features, setFeatures] = useState([]);
  const isMounted = useRef(true);
  const eventHandlersRef = useRef([]);

  // Cleanup draw control
  const cleanupDraw = useCallback(() => {
    if (drawRef.current && map && !map._removed) {
      try {
        // Remove event listeners
        eventHandlersRef.current.forEach(({ event, handler }) => {
          try {
            map.off(event, handler);
          } catch (e) {
            // Ignore
          }
        });
        eventHandlersRef.current = [];

        // Remove control
        if (map.hasControl(drawRef.current)) {
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

  // Initialize draw control
  useEffect(() => {
    // Check if map is ready and component is mounted
    if (!map || map._removed || !isMounted.current) {
      console.debug("Map not ready for DrawControl");
      return;
    }

    // Clean up any existing draw instance
    cleanupDraw();

    try {
      // Create draw control with custom styles
      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true,
        },
        defaultMode: "simple_select",
        styles: mapboxDrawStyles,
      });

      // Add draw control to map
      map.addControl(draw, "top-right");
      drawRef.current = draw;

      // Set up event listeners
      const handleUpdate = (event) => {
        if (!isMounted.current || !drawRef.current) return;

        try {
          const editType = event.type;
          if (
            (editType === "draw.create" || editType === "draw.update") &&
            event.features.length > 0
          ) {
            const feature = event.features[0];
            if (
              feature &&
              feature.geometry &&
              feature.geometry.type === "Polygon"
            ) {
              try {
                const wkt = stringifyGeoJSON(feature);
                if (isMounted.current) {
                  setMapPolygon(wkt);
                  if (editType === "draw.create") {
                    // Switch back to simple_select mode after drawing
                    draw.changeMode("simple_select");
                  }
                }
              } catch (error) {
                console.error("Failed to stringify polygon:", error);
              }
            }
          }
        } catch (error) {
          console.debug("Draw update error:", error);
        }
      };

      const handleDelete = (event) => {
        if (!isMounted.current || !drawRef.current) return;

        try {
          const polygonBtn = document.querySelector(".mapbox-gl-draw_polygon");
          const allFeatures = draw.getAll().features;
          console.log(allFeatures);
          if (allFeatures.length === 0 && isMounted.current) {
            setMapPolygon(null);
            if (polygonBtn) {
              polygonBtn.classList.toggle("disabled", false);
            }
          }
        } catch (error) {
          console.debug("Draw delete error:", error);
        }
      };

      const handleModeChange = (event) => {
        // when mode is simple select, if polygon exists prevent drawing
        if (event.mode === "simple_select") {
          const data = draw.getAll();
          const hasPolygon = data.features.some(
            (f) => f.geometry.type === "Polygon",
          );
          const polygonBtn = document.querySelector(".mapbox-gl-draw_polygon");
          if (polygonBtn) {
            polygonBtn.classList.toggle("disabled", hasPolygon);
          }
        }
      };

      // Register event listeners
      map.on("draw.create", handleUpdate);
      map.on("draw.update", handleUpdate);
      map.on("draw.delete", handleDelete);
      map.on("draw.modechange", handleModeChange);

      // Store handlers for cleanup
      eventHandlersRef.current = [
        { event: "draw.create", handler: handleUpdate },
        { event: "draw.update", handler: handleUpdate },
        { event: "draw.delete", handler: handleDelete },
        { event: "draw.modechange", handler: handleModeChange },
      ];

      // Cleanup
      return () => {
        cleanupDraw();
      };
    } catch (error) {
      console.error("Failed to initialize draw control:", error);
      return cleanupDraw;
    }
  }, [map, cleanupDraw, setMapPolygon]);

  // TODO: disabled when one already exists?
  return <></>;
};

export default MapPolygonFilter;
