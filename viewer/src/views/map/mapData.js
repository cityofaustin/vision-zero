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

export const cityCouncilDistrictsUrl =
  "https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/BOUNDARIES_single_member_districts/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&relationParam=&returnGeodetic=false&outFields=*&returnGeometry=true&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=8&outSR=4326&defaultSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=json";
