import moment from "moment";

// Time data
export const today = moment().format("YYYY-MM-DD");
export const todayMonthYear = moment().format("-MM-DD");
export const thisYear = moment().format("YYYY");
export const lastYear = moment()
  .subtract(1, "year")
  .format("YYYY");
