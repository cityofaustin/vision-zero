import moment from "moment";

export const formatCostToDollars = cost =>
  !!cost ? `$${cost.toLocaleString()}` : "--";

export const formatDateTimeString = datetime =>
  moment(datetime).format("YYYY-MM-DD hh:mm:ss a");
