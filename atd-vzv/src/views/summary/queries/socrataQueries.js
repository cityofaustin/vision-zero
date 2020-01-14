import {
  thisYear,
  lastYear,
  today,
  todayMonthYear
} from "../../../constants/time";

export const crashEndpointUrl = `https://data.austintexas.gov/resource/y2wy-tgr5.json`;
export const demographicsEndpointUrl = `https://data.austintexas.gov/resource/xecs-rpy9.json`;

// Year to date queries
export const fatalitiesYTDUrl = `${crashEndpointUrl}?$where=death_cnt > 0 AND crash_date between '${thisYear}-01-01T00:00:00' and '${today}T23:59:59'`;
export const seriousInjuriesYTDUrl = `${crashEndpointUrl}?$where=sus_serious_injry_cnt > 0 AND crash_date between '${thisYear}-01-01T00:00:00' and '${today}T23:59:59'`;
export const totalCrashesYTDUrl = `${crashEndpointUrl}?$where= crash_date between '${thisYear}-01-01T00:00:00' and '${today}T23:59:59'`;
export const yearsOfLifeLostYTDUrl = `${demographicsEndpointUrl}?$where=prsn_injry_sev_id = '4' AND crash_date between '${thisYear}-01-01T00:00:00' and '${today}T23:59:59'`;

// Previous year queries
export const previousYearFatalitiesUrl = `${crashEndpointUrl}?$where=death_cnt > 0 AND crash_date between '${lastYear}-01-01T00:00:00' and '${lastYear}${todayMonthYear}T23:59:59'`;
export const previousYearSeriousInjuriesUrl = `${crashEndpointUrl}?$where=sus_serious_injry_cnt > 0 AND crash_date between '${lastYear}-01-01T00:00:00' and '${lastYear}${todayMonthYear}T23:59:59'`;
export const previousYearYearsOfLifeLostYTDUrl = `${demographicsEndpointUrl}?$where=prsn_injry_sev_id = '4' AND crash_date between '${lastYear}-01-01T00:00:00' and '${lastYear}${todayMonthYear}T23:59:59'`;
