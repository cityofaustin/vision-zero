import { isDevelopment } from "../../../constants/nav";

const crashDatasetID = isDevelopment ? "y2wy-tgr5" : "y2wy-tgr5";
const personDatasetID = isDevelopment ? "xecs-rpy9" : "xecs-rpy9";

export const crashEndpointUrl = `https://data.austintexas.gov/resource/${crashDatasetID}.json`;
export const crashGeoJSONEndpointUrl = `https://data.austintexas.gov/resource/${crashDatasetID}.geojson`;
export const personEndpointUrl = `https://data.austintexas.gov/resource/${personDatasetID}.json`;

export const mapRequestFields = [
  "point",
  "death_cnt",
  "sus_serious_injry_cnt",
  "latitude",
  "longitude",
  "crash_id",
  "units_involved",
  "crash_date",
];
