import moment from "moment";

// Time data
export const today = moment().format("YYYY-MM-DD");
export const thisYear = moment().format("YYYY");
export const oneYearAgo = moment()
  .subtract(1, "year")
  .format("YYYY-MM-DD");
export const todayMonthYear = moment().format("-MM-DD");
export const thisMonth = moment().format("MM");
export const lastMonth = moment()
  .subtract(1, "month")
  .format("MM");
export const lastDayOfLastMonth = moment(
  `${thisYear}-${lastMonth}`,
  "YYYY-MM"
).daysInMonth();
export const lastYear = moment()
  .subtract(1, "year")
  .format("YYYY");
export const lastMonthString = moment()
  .subtract(1, "month")
  .format("MMMM");

// Map time data
const rollingYearsOfData = 5;

export const mapDataMinDate = new Date(
  moment()
    .subtract(rollingYearsOfData, "year")
    .format("MM/DD/YYYY")
);
export const mapDataMaxDate = new Date(moment());

export const mapStartDate =
  moment()
    .subtract(rollingYearsOfData, "year")
    .format("YYYY-MM-DD") + "T00:00:00";
export const mapEndDate = moment().format("YYYY-MM-DD") + "T23:59:59";
