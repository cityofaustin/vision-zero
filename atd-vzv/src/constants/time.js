import moment from "moment";

// Number of past years data to fetch
// 4 full years of data, plus data up to the last complete month of the current year
export const ROLLING_YEARS_OF_DATA = 4;

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
  .subtract(1, "month")
  .subtract(ROLLING_YEARS_OF_DATA, "year")
  .startOf("year");

// Last date of records that should be referenced in VZV (through last complete month of data)
export const dataEndDate = moment().subtract(1, "month").endOf("month");

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

// Map time data
export const mapDataMinDate = new Date(dataStartDate.format("MM/DD/YYYY"));
export const mapDataMaxDate = new Date(dataEndDate);

export const mapStartDate = dataStartDate.format("YYYY-MM-DD") + "T00:00:00";
export const mapEndDate = dataEndDate.format("YYYY-MM-DD") + "T23:59:59";
