import { isDevelopment } from "../../../constants/nav";

const crashDatasetID = isDevelopment ? "3aut-fhzp" : "y2wy-tgr5";
const demographicsDatasetID = isDevelopment ? "v3x4-fjgm" : "xecs-rpy9";

export const crashEndpointUrl = `https://data.austintexas.gov/resource/${crashDatasetID}.json`;
export const crashGeoJSONEndpointUrl = `https://data.austintexas.gov/resource/${crashDatasetID}.geojson`;
export const demographicsEndpointUrl = `https://data.austintexas.gov/resource/${demographicsDatasetID}.json`;
