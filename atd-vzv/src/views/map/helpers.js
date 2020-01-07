export const createMapDataUrl = filters => {
  let whereFilterString = "";
  filters.forEach(filter => {
    if (filter.type === "where") {
      whereFilterString += ` ${filter.operator} ${filter.syntax}`;
    }
  });
  return `https://data.austintexas.gov/resource/y2wy-tgr5.geojson?$limit=1000&$where=crash_date between '2019-01-01T00:00:00' and '2019-12-07T23:59:59' ${whereFilterString}`;
};
