export const mapInitalViewState = {
  latitude: 30.268039,
  longitude: -97.742828,
  zoom: 11,
  bearing: 0,
  pitch: 0,
};

export const mapNavBbox = {
  longitude: { min: -98.1708, max: -97.3111 },
  latitude: { min: 30.0226, max: 30.6251 },
};

// Put together the bounding box for the geocoder
// Do not move this into the geocoder component because it will cause a re-render
// of the geocoder component which causes the results dropdown to stay open.
const { latitude, longitude } = mapNavBbox;
export const geocoderBbox = [
  longitude.min,
  latitude.min,
  longitude.max,
  latitude.max,
];
