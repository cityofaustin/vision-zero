import { useEffect } from "react";
import { mapRequestFields } from "../summary/queries/socrataQueries";
import { format } from "date-fns";

const convertDateToSocrataFormat = (date, suffix) =>
  format(new Date(date), "yyyy-MM-dd") + suffix;

const generateWhereFilters = (filters) => {
  // Store filter group query strings
  let whereFiltersArray = [];
  // Collect filter group names and remove duplicates to build query parameters by groups
  const groupArray = [...new Set(filters.map((filter) => filter.group))];

  groupArray.forEach((group) => {
    // For each group, create a query string enclosed in parentheses
    let groupFilterString = "(";
    // Increment to keep track of when to insert logical operator
    let filterCount = 0;
    filters.forEach((filter) => {
      if (group === filter.group) {
        // Don't insert logical operator for first filter, we want ( filter OR filter ) format
        if (filterCount === 0) {
          groupFilterString += `${filter.syntax}`;
        } else {
          groupFilterString += ` ${filter.operator} ${filter.syntax}`;
        }
        filterCount += 1;
      }
    });
    groupFilterString += ")";
    whereFiltersArray.push(groupFilterString);
  });
  // Return all filter group queries joined with AND operator
  return whereFiltersArray.join(" AND ");
};

export const createMapDataUrl = (
  endpoint,
  filters,
  dateRange,
  mapPolygon,
  mapTimeWindow = "",
) => {
  const whereFilterString = generateWhereFilters(filters);
  const filterCount = filters.length;

  // SideMapControlDateRange uses null to check if user set dates so
  // need to handle it and avoid unnecessary API calls
  if (dateRange.start === null || dateRange.end === null) return null;
  const startDate = convertDateToSocrataFormat(dateRange.start, "T00:00:00");
  const endDate = convertDateToSocrataFormat(dateRange.end, "T23:59:59");

  // Return null to prevent populating map with unfiltered data
  return filterCount === 0
    ? null
    : `${endpoint}?$select=${mapRequestFields.join(",")}` +
        `&$limit=100000` +
        `&$where=crash_timestamp_ct between '${startDate}' and '${endDate}'` +
        // if there is a polygon selected, add as filter
        ((!!mapPolygon && ` AND within_polygon(point, '${mapPolygon}')`) ||
          "") +
        // if there are filters applied, add AND operator to create valid query url
        `${filters.length > 0 ? " AND" : ""} ${whereFilterString || ""}` +
        `${mapTimeWindow}`;
};

/**
 * Listen for a Mapbox map event name, invoke a callback, and clean up
 * @param {String} eventName - name of Mapbox map event
 * @param {Function} callback - function to call when event is triggered
 * @param {Object} mapRef - React ref to Mapbox map
 */
export function useMapEventHandler(eventName, callback, mapRef) {
  useEffect(() => {
    if (!mapRef.current) return;

    const currentMapRef = mapRef.current.getMap();
    const mapDataListener = currentMapRef.on(eventName, function () {
      callback();
    });

    return () => {
      currentMapRef.off(eventName, mapDataListener);
    };
  }, [eventName, callback, mapRef]);
}

// Draw styles adapted from '@mapbox/mapbox-gl-draw/src/lib/theme.js';
const blue = "#3bb2d0";
const orange = "#fbb03b";
const white = "#fff";
//
export const mapboxDrawStyles = [
  // Polygons
  //   Solid fill
  //   Active state defines color
  {
    id: "gl-draw-polygon-fill",
    type: "fill",
    filter: ["all", ["==", "$type", "Polygon"]],
    paint: {
      "fill-color": ["case", ["==", ["get", "active"], "true"], blue, blue],
      "fill-opacity": 0.1,
    },
  },
  // Lines
  // Polygon
  //   Matches Lines AND Polygons
  //   Active state defines color
  {
    id: "gl-draw-lines",
    type: "line",
    filter: ["any", ["==", "$type", "LineString"], ["==", "$type", "Polygon"]],
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-color": ["case", ["==", ["get", "active"], "true"], blue, blue],
      "line-dasharray": [
        "case",
        ["==", ["get", "active"], "true"],
        [0.2, 2],
        [2, 0],
      ],
      "line-width": 2,
    },
  },
  // Points
  //   Circle with an outline
  //   Active state defines size and color
  {
    id: "gl-draw-point-outer",
    type: "circle",
    filter: ["all", ["==", "$type", "Point"], ["==", "meta", "feature"]],
    paint: {
      "circle-radius": ["case", ["==", ["get", "active"], "true"], 7, 5],
      "circle-color": white,
    },
  },
  {
    id: "gl-draw-point-inner",
    type: "circle",
    filter: ["all", ["==", "$type", "Point"], ["==", "meta", "feature"]],
    paint: {
      "circle-radius": ["case", ["==", ["get", "active"], "true"], 5, 3],
      "circle-color": ["case", ["==", ["get", "active"], "true"], blue, blue],
    },
  },
  // Vertex
  //   Visible when editing polygons and lines
  //   Similar behaviour to Points
  //   Active state defines size
  {
    id: "gl-draw-vertex-outer",
    type: "circle",
    filter: [
      "all",
      ["==", "$type", "Point"],
      ["==", "meta", "vertex"],
      ["!=", "mode", "simple_select"],
    ],
    paint: {
      "circle-radius": ["case", ["==", ["get", "active"], "true"], 7, 5],
      "circle-color": white,
    },
  },
  {
    id: "gl-draw-vertex-inner",
    type: "circle",
    filter: [
      "all",
      ["==", "$type", "Point"],
      ["==", "meta", "vertex"],
      ["!=", "mode", "simple_select"],
    ],
    paint: {
      "circle-radius": ["case", ["==", ["get", "active"], "true"], 5, 3],
      "circle-color": blue,
    },
  },
  // Midpoint
  //   Visible when editing polygons and lines
  //   Tapping or dragging them adds a new vertex to the feature
  {
    id: "gl-draw-midpoint",
    type: "circle",
    filter: ["all", ["==", "meta", "midpoint"]],
    paint: {
      "circle-radius": 3,
      "circle-color": orange,
    },
  },
];
