// Helpers to handle Socrata responses for Summary view components

export const calculateTotalFatalities = data => {
  let total = 0;
  data.data.forEach(record => (total += parseInt(record.death_cnt)));
  return total;
};

export const calculateTotalInjuries = data => {
  let total = 0;
  data.data.forEach(
    record => (total += parseInt(record.sus_serious_injry_cnt))
  );
  return total;
};

export const calculateTotalCrashes = data => {
  let total = 0;
  data.data.forEach(record => (total += 1));
  return total;
};

export const getYearsOfLifeLost = fatalityData => {
  // Assume 75 year life expectancy,
  // Find the difference between person.prsn_age & 75
  // Sum over the list of ppl with .reduce
  return fatalityData.reduce((accumulator, fatalityRecord) => {
    let years = 0;
    if (fatalityRecord.prsn_age !== undefined) {
      let yearsLifeLost = 75 - Number(fatalityRecord.prsn_age);
      // What if the person is older than 75?
      // For now, so we don't have negative numbers,
      // Assume years of life lost is 0
      years = yearsLifeLost < 0 ? 0 : yearsLifeLost;
    }
    return accumulator + years;
  }, 0); // start with a count at 0 years
};
