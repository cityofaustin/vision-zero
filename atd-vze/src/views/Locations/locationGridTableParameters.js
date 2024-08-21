export const locationsGridTableAdvancedFilters = {
  groupGeography: {
    icon: "map-marker",
    label: "Geography",
    filters: [
      {
        id: "geo_afd",
        label: "Include Outside Of Austin Full Purpose",
        invert_toggle_state: true,
        filter: {
          where: [
            {
              council_district: "_gt: 0",
            },
          ],
        },
      },
      {
        id: "level_1",
        label: "Include \"Level 5\" polygons",
        invert_toggle_state: true,
        filter: {
          where: [
            {
              location_group: "_eq: 1",
            },
          ],
        },
      },
    ],
  },
};
