import React, { useState, useRef, useCallback, useEffect } from "react";
import { useMap } from "react-map-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { stringify as stringifyGeoJSON } from "wellknown";
import styled from "styled-components";

const MapPolygonFilter = ({ setMapPolygon }) => {
  const { current: map } = useMap();
  const drawRef = useRef(null);
  const [features, setFeatures] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const isMounted = useRef(true);
  const eventHandlersRef = useRef([]);

  const StyledDrawTools = styled.div`
    .disabled {
      filter: opacity(0.3) drop-shadow(0 0 0 #fff);
      cursor: default;
    }

    .mapboxgl-ctrl-top-right {
      position: absolute;
      top: 116px;
    }
  `;

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
        styles: [
          {
            id: "gl-draw-polygon-fill",
            type: "fill",
            filter: ["all", ["==", "$type", "Polygon"]],
            paint: {
              "fill-color": "#3bb2d0",
              "fill-opacity": 0.1,
            },
          },
          {
            id: "gl-draw-polygon-stroke",
            type: "line",
            filter: ["all", ["==", "$type", "Polygon"]],
            paint: {
              "line-color": "#3bb2d0",
              "line-width": 2,
            },
          },
          {
            id: "gl-draw-polygon-midpoint",
            type: "circle",
            filter: ["all", ["==", "$type", "Point"]],
            paint: {
              "circle-radius": 3,
              "circle-color": "#fbb03b",
            },
          },
        ],
      });

      // Add draw control to map
      map.addControl(draw, "top-right");
      drawRef.current = draw;

      // Set up event listeners
      const handleUpdate = (event) => {
        if (!isMounted.current || !drawRef.current) return;

        try {
          const editType = event.type;
          if (editType === "draw.create" && event.features.length > 0) {
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
                  setIsDrawing(false);
                  // Switch back to simple_select mode after drawing
                  draw.changeMode("simple_select");
                }
              } catch (error) {
                console.error("Failed to stringify polygon:", error);
              }
            }
          }
          else {
            console.log(editType, draw)
          }
        } catch (error) {
          console.debug("Draw update error:", error);
        }
      };

      const handleDelete = (event) => {
        if (!isMounted.current || !drawRef.current) return;

        try {
          const newFeatures = draw.getAll().features;
          setFeatures(newFeatures);
          if (newFeatures.length === 0 && isMounted.current) {
            setMapPolygon(null);
          }
        } catch (error) {
          console.debug("Draw delete error:", error);
        }
      };

      // Register event listeners
      map.on("draw.create", handleUpdate);
      map.on("draw.update", handleUpdate);
      map.on("draw.delete", handleDelete);

      // Store handlers for cleanup
      eventHandlersRef.current = [
        { event: "draw.create", handler: handleUpdate },
        { event: "draw.update", handler: handleUpdate },
        { event: "draw.delete", handler: handleDelete },
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

  // Handle delete button click
  const _onDelete = useCallback(() => {
    if (!drawRef.current || !isMounted.current) return;

    try {
      const features = drawRef.current.getAll().features;
      // Delete all features
      features.forEach((feature) => {
        try {
          drawRef.current.delete(feature.id);
        } catch (e) {
          // Ignore individual delete errors
        }
      });
      setFeatures([]);
      setMapPolygon(null);
      setIsDrawing(false);
      drawRef.current.changeMode("simple_select");
    } catch (error) {
      console.debug("Delete error:", error);
    }
  }, [setMapPolygon]);

  // Handle draw button click
  const _handleDrawClick = useCallback(() => {
    if (!drawRef.current || !isMounted.current) return;

    try {
      const features = drawRef.current.getAll().features;
      if (features.length > 0) {
        // If there's already a polygon, don't allow drawing
        return;
      }

      setIsDrawing(true);
      drawRef.current.changeMode("draw_polygon");
    } catch (error) {
      console.debug("Draw click error:", error);
    }
  }, []);

  const _renderDrawTools = () => {
    const isDisabled = features.length > 0;
    return (
      <StyledDrawTools>
        <div className="mapboxgl-ctrl-top-right">
          <div className="mapboxgl-ctrl-group mapboxgl-ctrl">
            <button
              className={`mapbox-gl-draw_ctrl-draw-btn mapbox-gl-draw_polygon ${
                isDisabled && "disabled"
              }`}
              disabled={isDisabled}
              title="Draw a polygon to filter data"
              onClick={_handleDrawClick}
            />
            <button
              className="mapbox-gl-draw_ctrl-draw-btn mapbox-gl-draw_trash"
              title="Remove polygon filter"
              onClick={_onDelete}
            />
          </div>
        </div>
      </StyledDrawTools>
    );
  };

  return <>{_renderDrawTools()}</>;
};

export default MapPolygonFilter;
