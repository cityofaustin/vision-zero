const generateWhereFilters = filters => {
  // TODO: Collect filters with same section and create groups
  let whereFilterString = "(";
  filters.forEach(filter => {
    if (filter.type === "where") {
      whereFilterString += ` ${filter.operator} ${filter.syntax}`;
    }
  });
  return whereFilterString + `)`;
};

export const createMapDataUrl = filters => {
  const whereFilterString = generateWhereFilters(filters);

  console.log(
    `https://data.austintexas.gov/resource/y2wy-tgr5.geojson?$limit=1000&$where=crash_date between '2019-01-01T00:00:00' and '2019-12-07T23:59:59' ${filters.length >
      0 && "AND"} ${whereFilterString}`
  );
  return (
    `https://data.austintexas.gov/resource/y2wy-tgr5.geojson?$limit=1000` +
    `&$where=crash_date between '2019-01-01T00:00:00' and '2019-12-07T23:59:59'` +
    `${filters.length > 0 && "AND"} ${whereFilterString}`
  );
};

// https://data.austintexas.gov/resource/y2wy-tgr5.geojson?$limit=1000&$where=crash_date between '2019-01-01T00:00:00' and '2019-12-07T23:59:59' AND (pedestrian_fl = 'Y' OR pedalcyclist_fl = 'Y') AND death_cnt > 0
// https://data.austintexas.gov/resource/y2wy-tgr5.geojson?$limit=1000&$where=crash_date between '2019-01-01T00:00:00' and '2019-12-07T23:59:59' AND (pedestrian_fl = 'Y' OR pedalcyclist_fl = 'Y') AND (death_cnt > 0 AND sus_serious_injry_cnt > 0)

// TODO: Need to set operator for how button group filters stack with other button group filters MODE *AND* TYPE
