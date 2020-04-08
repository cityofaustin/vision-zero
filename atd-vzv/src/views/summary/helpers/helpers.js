import { lifespanYears } from "../../../constants/calc";
import { dataEndDate } from "../../../constants/time";
// Helpers to handle Socrata responses for Summary view components

export const calcSummaryTotalFatalities = (data, prevYear, currentYear) =>
  data.reduce(
    (accumulator, record) => {
      const recordYear = record.crash_date.slice(0, 4);
      accumulator = {
        ...accumulator,
        [recordYear]: (accumulator[recordYear] += parseInt(record.death_cnt)),
      };
      return accumulator;
    },
    { [prevYear]: 0, [currentYear]: 0 }
  );

export const calcSummaryTotalSeriousInjuries = (data, prevYear, currentYear) =>
  data.reduce(
    (accumulator, record) => {
      const recordYear = record.crash_date.slice(0, 4);
      accumulator = {
        ...accumulator,
        [recordYear]: (accumulator[recordYear] += parseInt(
          record.sus_serious_injry_cnt
        )),
      };
      return accumulator;
    },
    { [prevYear]: 0, [currentYear]: 0 }
  );

export const calcSummaryTotalCrashes = (data, prevYear, currentYear) =>
  data.reduce(
    (accumulator, record) => {
      const recordYear = record.crash_date.slice(0, 4);
      accumulator = {
        ...accumulator,
        [recordYear]: (accumulator[recordYear] += 1),
      };
      return accumulator;
    },
    { [prevYear]: 0, [currentYear]: 0 }
  );

const calcYearsOfLifeLost = (record) => {
  // Assume 75 year life expectancy,
  // Find the difference between person.prsn_age & 75
  let years = 0;
  if (record.prsn_age !== undefined) {
    let yearsLifeLost = lifespanYears - Number(record.prsn_age);
    // What if the person is older than 75?
    // For now, so we don't have negative numbers,
    // Assume years of life lost is 0
    years = yearsLifeLost < 0 ? 0 : yearsLifeLost;
  }
  return years;
};

export const getSummaryYearsOfLifeLost = (data, prevYear, currentYear) => {
  return data.reduce(
    (accumulator, record) => {
      const recordYear = record.crash_date.slice(0, 4);
      accumulator = {
        ...accumulator,
        [recordYear]: (accumulator[recordYear] += calcYearsOfLifeLost(record)),
      };
      return accumulator;
    },
    { [prevYear]: 0, [currentYear]: 0 }
  ); // start with a count at 0 years
};

export const getYearsAgoLabel = (yearsAgo) => {
  return dataEndDate.clone().subtract(yearsAgo, "year").format("YYYY");
};
