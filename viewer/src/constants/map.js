// Build query string for crash type filter
export const createModeFilterString = (isMapTypeSet, config) => {
  if (isMapTypeSet.fatal && isMapTypeSet.injury) {
    return `${config.fatalSyntax} ${config.operator} ${config.injurySyntax}`;
  } else if (isMapTypeSet.fatal) {
    return `${config.fatalSyntax}`;
  } else if (isMapTypeSet.injury) {
    return `${config.injurySyntax}`;
  }
};

export const mapFilterReducer = (mapFilters, action) => {
  const { type, payload } = action;

  switch (type) {
    case "setInitialModeFilters":
      const initialFiltersArray = payload;
      return payload;
    case "updateModeSyntax":
      const isMapTypeSet = payload;

      const updatedModeFilters = mapFilters.map((filter) => ({
        ...filter,
        syntax: createModeFilterString(isMapTypeSet, filter),
      }));
      return updatedModeFilters;
    case "updateModeFilters":
      const updatedFiltersArray = payload;
      return updatedFiltersArray;
    default:
      return null;
  }
};
