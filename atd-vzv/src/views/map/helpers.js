import { crashEndpointUrl } from "../../views/summary/queries/socrataQueries";

const generateWhereFilters = filters => {
  // Store filter group query strings
  let whereFiltersArray = [];
  // Collect filter group names and remove duplicates to build query parameters by groups
  const groupArray = [...new Set(filters.map(filter => filter.group))];

  groupArray.forEach(group => {
    // For each group, create a query string enclosed in parentheses
    let groupFilterString = "(";
    // Increment to keep track of when to insert logical operator
    let filterCount = 0;
    filters.forEach(filter => {
      if (group === filter.group) {
        // Don't insert logical operator for first filter, we want ( filter OR filter ) format
        if (filterCount === 0) {
          groupFilterString += `${filter.syntax}`;
        } else {
          groupFilterString += ` ${filter.operator} ${filter.syntax}`;
        }
        filterCount += 1;
      }
    });
    groupFilterString += ")";
    whereFiltersArray.push(groupFilterString);
  });
  // Return all filter group queries joined with AND operator
  return whereFiltersArray.join(" AND ");
};

export const createMapDataUrl = (filters, dateRange) => {
  const whereFilterString = generateWhereFilters(filters);

  return (
    `${crashEndpointUrl}?$limit=1000` +
    `&$where=crash_date between '${dateRange.start}' and '${dateRange.end}'` +
    // if there are filters applied, add AND operator to create valid query url
    `${filters.length > 0 ? "AND" : ""} ${whereFilterString || ""}`
  );
};
