import {
  thisYear,
  lastYear,
  lastMonth,
  lastDayOfLastMonth
} from "../../../constants/time";

export const crashEndpointUrl = `https://data.austintexas.gov/resource/y2wy-tgr5.json`;
export const crashGeoJSONEndpointUrl = `https://data.austintexas.gov/resource/y2wy-tgr5.geojson`;
export const demographicsEndpointUrl = `https://data.austintexas.gov/resource/v3x4-fjgm.json`;

// Year to date queries
export const thisYearFatalitiesUrl = `${crashEndpointUrl}?$where=apd_confirmed_death_count > 0 AND crash_date between '${thisYear}-01-01T00:00:00' and '${thisYear}-${lastMonth}-${lastDayOfLastMonth}T23:59:59'`;
export const thisYearSeriousInjuriesUrl = `${crashEndpointUrl}?$where=sus_serious_injry_cnt > 0 AND crash_date between '${thisYear}-01-01T00:00:00' and '${thisYear}-${lastMonth}-${lastDayOfLastMonth}T23:59:59'`;
export const thisYearTotalCrashesUrl = `${crashEndpointUrl}?$where=crash_date between '${thisYear}-01-01T00:00:00' and '${thisYear}-${lastMonth}-${lastDayOfLastMonth}T23:59:59'&$limit=100000`;
export const thisYearYearsOfLifeLostUrl = `${demographicsEndpointUrl}?$where=prsn_injry_sev_id = '4' AND crash_date between '${thisYear}-01-01T00:00:00' and '${thisYear}-${lastMonth}-${lastDayOfLastMonth}T23:59:59'`;

// Previous year queries
export const previousYearFatalitiesUrl = `${crashEndpointUrl}?$where=apd_confirmed_death_count > 0 AND crash_date between '${lastYear}-01-01T00:00:00' and '${lastYear}-12-31T23:59:59'`;
export const previousYearSeriousInjuriesUrl = `${crashEndpointUrl}?$where=sus_serious_injry_cnt > 0 AND crash_date between '${lastYear}-01-01T00:00:00' and '${lastYear}-12-31T23:59:59'`;
export const previousYearTotalCrashesUrl = `${crashEndpointUrl}?$where=crash_date between '${lastYear}-01-01T00:00:00' and '${lastYear}-12-31T23:59:59'&$limit=100000`;
export const previousYearYearsOfLifeLostUrl = `${demographicsEndpointUrl}?$where=prsn_injry_sev_id = '4' AND crash_date between '${lastYear}-01-01T00:00:00' and '${lastYear}-12-31T23:59:59'`;
