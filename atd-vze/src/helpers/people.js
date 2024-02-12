import { useMemo } from "react";

/**
 * Return total years of life lost for all people in a crash using years_of_life_lost field
 * @param {Array|undefined} primaryPeopleRecords - Array of primary people records
 * @param {Array|undefined} peopleRecords - Array of people records
 * @returns
 */
export const useTotalYearsOfLifeLost = ({
  primaryPeopleRecords = [],
  peopleRecords = [],
}) =>
  useMemo(() => {
    console.log("this ran");
    const allPeopleRecords = [...primaryPeopleRecords, ...peopleRecords];

    return allPeopleRecords.reduce((acc, person) => {
      const yearsOfLifeLost = person?.years_of_life_lost || 0;
      return acc + yearsOfLifeLost;
    }, 0);
  }, [primaryPeopleRecords, peopleRecords]);
