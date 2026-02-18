import { QueryConfig, FilterGroup } from "@/types/queryBuilder";
import { DEFAULT_QUERY_LIMIT } from "@/utils/constants";
import { getYearsAgoDate, makeDateFilters } from "@/utils/dates";

const locationCrashesFiltercards: FilterGroup[] = [
  {
    id: "primary_filter_card",
    label: "Crash type",
    groupOperator: "_or",
    filterGroups: [
      {
        id: "cr3_crashes",
        label: "CR3 crashes",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "cr3_crashes",
            column: "type",
            operator: "_eq",
            value: "CR3",
          },
        ],
      },
      {
        id: "non_cr3_crashes",
        label: "Non-CR3 crashes",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "cr3_crashes",
            column: "type",
            operator: "_eq",
            value: "NON-CR3",
          },
        ],
      },
    ],
  },
  {
    id: "injuries_filter_card",
    label: "Injuries",
    groupOperator: "_or",
    filterGroups: [
      {
        id: "vz_fatality_crashes",
        label: "Fatal injuries - Vision Zero",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "vz_fatality_crashes",
            column: "vz_fatality_count",
            operator: "_gt",
            value: 0,
          },
        ],
      },
      {
        id: "suspected_serious_injury_crashes",
        label: "Suspected serious injuries",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "suspected_serious_injury_crashes",
            column: "sus_serious_injry_count",
            operator: "_gt",
            value: 0,
          },
        ],
      },
    ],
  },
  {
    id: "units_filter_card",
    label: "Units involved",
    groupOperator: "_or",
    filterGroups: [
      {
        id: "motor_vehicle",
        label: "Motor vehicle",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "unit_description",
            column: "unit_desc_id",
            operator: "_eq",
            value: 1,
            relationshipName: "units",
          },
          {
            id: "vehicle_body_style",
            column: "veh_body_styl_id",
            operator: "_nin",
            value: [71, 90],
            relationshipName: "units",
          },
        ],
      },
      {
        id: "motorcycle",
        label: "Motorcycle",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "unit_description",
            column: "unit_desc_id",
            operator: "_eq",
            value: 1,
            relationshipName: "units",
          },
          {
            id: "vehicle_body_style",
            column: "veh_body_styl_id",
            operator: "_in",
            value: [71, 90],
            relationshipName: "units",
          },
        ],
      },

      {
        id: "cyclist",
        label: "Cyclist",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "unit_description",
            column: "unit_desc_id",
            operator: "_eq",
            value: 3,
            relationshipName: "units",
          },
        ],
      },
      {
        id: "pedestrian",
        label: "Pedestrian",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "unit_description",
            column: "unit_desc_id",
            operator: "_eq",
            value: 4,
            relationshipName: "units",
          },
        ],
      },
      {
        id: "scooter_rider",
        label: "E-scooter rider",
        groupOperator: "_or",
        filters: [
          {
            id: "unit_description",
            column: "unit_desc_id",
            operator: "_eq",
            value: 77,
            relationshipName: "units",
          },
          {
            id: "vehicle_body_style",
            column: "veh_body_styl_id",
            operator: "_eq",
            value: 177,
            relationshipName: "units",
          },
        ],
      },
    ],
  },
];

export const locationCrashesQueryConfig: QueryConfig = {
  _version: 2,
  exportable: true,
  exportFilename: "location-crashes",
  tableName: "location_crashes_view",
  limit: DEFAULT_QUERY_LIMIT,
  offset: 0,
  sortColName: "crash_timestamp",
  sortAsc: false,
  searchFilter: {
    id: "search",
    value: "",
    column: "case_id",
    operator: "_ilike",
    wildcard: true,
  },
  searchFields: [
    { label: "Case ID", value: "case_id" },
    { label: "Crash ID", value: "record_locator" },
    { label: "Address", value: "address_display" },
    { label: "Collision type", value: "collsn_desc" },
  ],
  dateFilter: {
    mode: "5y",
    column: "crash_timestamp",
    filters: makeDateFilters("crash_timestamp", {
      start: getYearsAgoDate(5),
      end: null,
    }),
  },
  filterCards: locationCrashesFiltercards,
  mapConfig: {
    isActive: false,
    popupComponentName: "locationTableMap",
    layerProps: {
      id: "points-layer",
      type: "circle",
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          // zoom is 5 (or less)
          5,
          2,
          // zoom is 20 (or greater)
          20,
          10,
        ],
        "circle-color": "#1276d1",
        "circle-stroke-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          // zoom is 5 (or less)
          5,
          1,
          // zoom is 20 (or greater)
          20,
          3,
        ],
        "circle-stroke-color": "#fff",
      },
    },
    mapProps: {
      cooperativeGestures: true,
    },
    geojsonTransformerName: "latLon",
    defaultBasemap: "aerial",
  },
};
