import moment from "moment";

// Set the sliding window of data that feeds VZV
// Number of past years data to fetch
export const ROLLING_YEARS_OF_DATA = 4;
// Number of months window slides in the past (to display most accurate data)
export const MONTHS_AGO = 2;

// Create array of ints of last n years
export const yearsArray = () => {
  let years = [];
  let year = parseInt(dataEndDate.format("YYYY"));
  for (let i = 0; i <= ROLLING_YEARS_OF_DATA; i++) {
    years.unshift(year - i);
  }
  return years;
};

// First date of records that should be referenced in VZV (start of first year in rolling window)
export const dataStartDate = moment()
  .subtract(MONTHS_AGO, "month")
  .subtract(ROLLING_YEARS_OF_DATA, "year")
  .startOf("year");

// Last date of records that should be referenced in VZV (the last day of the month that is MONTHS_AGO months ago)
export const dataEndDate = moment()
  .subtract(MONTHS_AGO, "month")
  .endOf("month");

// Summary time data
export const summaryCurrentYearStartDate = dataEndDate
  .clone() // Moment objects are mutable
  .startOf("year")
  .format("YYYY-MM-DD");
export const summaryCurrentYearEndDate = dataEndDate.format("YYYY-MM-DD");

export const summaryLastYearStartDate = dataEndDate
  .clone()
  .startOf("year")
  .subtract(1, "year")
  .format("YYYY-MM-DD");
export const summaryLastYearEndDate = dataEndDate
  .clone()
  .subtract(1, "year")
  .format("YYYY-MM-DD");

export const currentYearString = summaryCurrentYearStartDate.slice(0, 4);
export const prevYearString = summaryLastYearStartDate.slice(0, 4);

// Map time data
// To decrease initial load time and focus map data to recent crashes, limit to current year of sliding window
export const mapStartDate = moment()
  .subtract(MONTHS_AGO, "month")
  .startOf("year");

export const mapEndDate = dataEndDate.clone();
