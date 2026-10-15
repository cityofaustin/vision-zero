const DATASET_IDS = {
// uncomment to use the actual staging dataset - we generally prefer to test with prod to make sure
// app changes do not alter reporting in unintended ways
//   staging: {
//     crash: "3aut-fhzp",
//     person: "v3x4-fjgm",
//   },
  staging: {
    crash: "y2wy-tgr5",
    person: "xecs-rpy9",
  },
  prod: {
    crash: "y2wy-tgr5",
    person: "xecs-rpy9",
  },
};

const crashDatasetID =
  import.meta.env.MODE === "production" ? DATASET_IDS.prod.crash : DATASET_IDS.staging.crash;
const personDatasetID =
  import.meta.env.MODE === "production" ? DATASET_IDS.prod.person : DATASET_IDS.staging.person;

export const crashEndpointUrl = `https://data.austintexas.gov/resource/${crashDatasetID}.json`;
export const crashGeoJSONEndpointUrl = `https://data.austintexas.gov/resource/${crashDatasetID}.geojson`;
export const personEndpointUrl = `https://data.austintexas.gov/resource/${personDatasetID}.json`;

export const mapRequestFields = [
  "point",
  "death_cnt",
  "sus_serious_injry_cnt",
  "latitude",
  "longitude",
  "id",
  "cris_crash_id",
  "units_involved",
  "crash_timestamp_ct",
];
