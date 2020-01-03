import { thisYear, lastYear, today, todayMonthYear } from "../helpers/time";

// Year to date queries
export const fatalitiesYTDUrl = `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where=death_cnt > 0 AND crash_date between '${thisYear}-01-01T00:00:00' and '${today}T23:59:59'`;
export const seriousInjuriesYTDUrl = `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where=sus_serious_injry_cnt > 0 AND crash_date between '${thisYear}-01-01T00:00:00' and '${today}T23:59:59'`;
export const totalCrashesYTDUrl = `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where= crash_date between '${thisYear}-01-01T00:00:00' and '${today}T23:59:59'`;
export const yearsOfLifeLostYTDUrl = `https://data.austintexas.gov/resource/xecs-rpy9.json?$where=prsn_injry_sev_id = '4' AND crash_date between '${thisYear}-01-01T00:00:00' and '${today}T23:59:59'`;

// Previous year queries
export const previousYearFatalitiesUrl = `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where=death_cnt > 0 AND crash_date between '${lastYear}-01-01T00:00:00' and '${lastYear}${todayMonthYear}T23:59:59'`;
