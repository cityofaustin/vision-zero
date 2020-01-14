import moment from "moment";

// Time data
export const today = moment().format("YYYY-MM-DD");
export const oneYearAgo = moment()
  .subtract(1, "year")
  .format("YYYY-MM-DD");
export const todayMonthYear = moment().format("-MM-DD");
export const thisYear = moment().format("YYYY");
export const lastYear = moment()
  .subtract(1, "year")
  .format("YYYY");

// Map time data
export const mapStartDate =
  moment()
    .subtract(1, "year")
    .format("YYYY-MM-DD") + "T00:00:00";
export const mapEndDate = moment().format("YYYY-MM-DD") + "T23:59:59";
