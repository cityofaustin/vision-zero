export const mapInit = {
  latitude: 30.268039,
  longitude: -97.742828,
  zoom: 11,
};

export const mapNavBbox = {
  longitude: { min: -98.1708, max: -97.3111 },
  latitude: { min: 30.0226, max: 30.6251 },
};

// Put together the bounding box for the geocoder
// Do not move this into the geocoder component because it will cause a re-render
// in of the geocoder component which causes the results dropdown to stay open.
const { latitude, longitude } = mapNavBbox;
export const geocoderBbox = [
  longitude.min,
  latitude.min,
  longitude.max,
  latitude.max,
];

export const travisCountyBboxGeoJSON = {
  type: "FeatureCollection",
  properties: {
    kind: "state",
    state: "TX",
  },
  features: [
    {
      type: "Feature",
      properties: {
        kind: "county",
        name: "Travis",
        state: "TX",
      },
      geometry: {
        type: "MultiPolygon",
        coordinates: [
          [
            [
              [0, 90],
              [180, 90],
              [180, -90],
              [0, -90],
              [-180, -90],
              [-180, 0],
              [-180, 90],
              [0, 90],
            ],
            [
              [-98.1708, 30.0226],
              [-97.3711, 30.0226],
              [-97.3711, 30.6251],
              [-98.1708, 30.6251],
              [-98.1708, 30.0226],
            ],
          ],
        ],
      },
    },
  ],
};
