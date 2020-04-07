import { lifespanYears } from "../../../constants/calc";
import { dataEndDate } from "../../../constants/time";
// Helpers to handle Socrata responses for Summary view components

export const calculateTotalFatalities = (data) =>
  data.reduce(
    (accumulator, record) => (accumulator += parseInt(record.death_cnt)),
    0
  );

export const calculateTotalInjuriesOfCurrentAndPrevYear = (
  data,
  prevYear,
  currentYear
) =>
  data.reduce(
    (accumulator, record) => {
      if (record.crash_date.includes(currentYear)) {
        accumulator = {
          ...accumulator,
          currentYearTotal: (accumulator.currentYearTotal += parseInt(
            record.sus_serious_injry_cnt
          )),
        };
      } else if (record.crash_date.includes(prevYear)) {
        accumulator = {
          ...accumulator,
          prevYearTotal: (accumulator.prevYearTotal += parseInt(
            record.sus_serious_injry_cnt
          )),
        };
      }
      return accumulator;
    },
    { currentYearTotal: 0, prevYearTotal: 0 }
  );

export const calculateTotalCrashes = (data) =>
  data.reduce((accumulator) => accumulator + 1, 0);

export const getYearsOfLifeLost = (fatalityData) => {
  // Assume 75 year life expectancy,
  // Find the difference between person.prsn_age & 75
  // Sum over the list of ppl with .reduce
  return fatalityData.reduce((accumulator, fatalityRecord) => {
    let years = 0;
    if (fatalityRecord.prsn_age !== undefined) {
      let yearsLifeLost = lifespanYears - Number(fatalityRecord.prsn_age);
      // What if the person is older than 75?
      // For now, so we don't have negative numbers,
      // Assume years of life lost is 0
      years = yearsLifeLost < 0 ? 0 : yearsLifeLost;
    }
    return accumulator + years;
  }, 0); // start with a count at 0 years
};

export const getYearsAgoLabel = (yearsAgo) => {
  return dataEndDate.clone().subtract(yearsAgo, "year").format("YYYY");
};
