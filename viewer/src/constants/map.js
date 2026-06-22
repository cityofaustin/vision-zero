export const mapFilterReducer = (mapFilters, action) => {
  const { type, payload } = action;

  switch (type) {
    case "setInitialModeFilters": {
      const initialFiltersArray = payload;
      return initialFiltersArray;
    }
    case "updateModeSyntax": {
      const isMapTypeSet = payload;

      const updatedModeFilters = mapFilters.map((filter) => ({
        ...filter,
        syntax: createModeFilterString(isMapTypeSet, filter),
      }));
      return updatedModeFilters;
    }
    case "updateModeFilters": {
      const updatedFiltersArray = payload;
      return updatedFiltersArray;
    }
    default:
      return null;
  }
};
