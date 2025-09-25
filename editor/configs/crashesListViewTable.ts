import { getYearsAgoDate, makeDateFilters } from "@/utils/dates";
import { QueryConfig, FilterGroup } from "@/types/queryBuilder";
// todo: enable different page size based on list vs map view
// import { DEFAULT_QUERY_LIMIT } from "@/utils/constants";

const crashesListViewfilterCards: FilterGroup[] = [
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
        id: "cris_fatality_crashes",
        label: "Fatal injuries - CRIS",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "cris_fatality_crashes",
            column: "cris_fatality_count",
            operator: "_gt",
            value: 0,
          },
        ],
      },
      {
        id: "law_enforcement_fatality_crashes",
        label: "Fatal injuries - Law enforcement",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "law_enforcement_fatality_crashes",
            column: "law_enf_fatality_count",
            operator: "_gt",
            value: 0,
          },
        ],
      },

      {
        id: "suspected_serious_injury_crashes",
        label: "Suspected serious injury crashes",
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
      //todo: check these _and vs _or
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
      // todo: "Other" switch
    ],
  },
  {
    id: "geography_filter_card",
    label: "Jurisdiction",
    groupOperator: "_and",
    filterGroups: [
      {
        id: "in_austin_full_purpose",
        label: "Include outside Austin Full Purpose",
        groupOperator: "_and",
        enabled: true,
        inverted: true,
        filters: [
          {
            id: "in_austin_full_purpose",
            column: "in_austin_full_purpose",
            operator: "_eq",
            value: true,
          },
        ],
      },
      {
        id: "is_coa_roadway",
        label: "COA roadway crashes only",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "is_coa_roadway",
            column: "is_coa_roadway",
            operator: "_eq",
            value: true,
          },
        ],
      },
      {
        id: "is_not_coa_roadway",
        label: "Non-COA roadway crashes only",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "is_not_coa_roadway",
            column: "is_coa_roadway",
            operator: "_eq",
            value: false,
          },
        ],
      },
    ],
  },
  {
    id: "internal_filters",
    label: "Internal",
    // because one of the filters is enabled and inverted we need to join using the "_and" operator
    groupOperator: "_and",
    filterGroups: [
      {
        id: "private_drive",
        label: "Include private drive crashes",
        groupOperator: "_and",
        enabled: true,
        inverted: true,
        filters: [
          {
            id: "private_drive",
            column: "private_dr_fl",
            operator: "_neq",
            value: true,
          },
        ],
      },
      {
        id: "is_temp_record",
        label: "Temporary records only",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "is_temp_record",
            column: "is_temp_record",
            operator: "_eq",
            value: true,
          },
        ],
      },
    ],
  },
];

export const crashesListViewQueryConfig: QueryConfig = {
  exportable: true,
  exportFilename: "crashes",
  tableName: "crashes_list_view",
  limit: 1000,
  offset: 0,
  sortColName: "crash_timestamp",
  sortAsc: false,
  searchFilter: {
    id: "search",
    value: "",
    column: "address_primary",
    operator: "_ilike",
    wildcard: true,
  },
  searchFields: [
    { label: "Address", value: "address_primary" },
    { label: "Crash ID", value: "record_locator" },
    { label: "Case ID", value: "case_id" },
  ],
  dateFilter: {
    mode: "1y",
    column: "crash_timestamp",
    filters: makeDateFilters("crash_timestamp", {
      start: getYearsAgoDate(1),
      end: null,
    }),
  },
  filterCards: crashesListViewfilterCards,
  mapConfig: {
    isActive: false,
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
    geojsonTransformerName: "latLon",
  },
};
