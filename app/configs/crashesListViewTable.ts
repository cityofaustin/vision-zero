import {
  getStartOfYearDate,
  makeDateFilters,
} from "@/components/TableDateSelector";
import { crashesListViewColumns } from "@/configs/crashesListViewColumns";
import { QueryConfig, FilterGroup } from "@/utils/queryBuilder";
import { DEFAULT_QUERY_LIMIT } from "@/utils/constants";

const columns = crashesListViewColumns.map((col) => String(col.name));

const crashesListViewfilterCards: FilterGroup[] = [
  {
    id: "injuries_filter_card",
    label: "Injuries",
    groupOperator: "_or",
    filterGroups: [
      {
        id: "vz_fatality_crashes",
        label: "Fatal crashes - Vision Zero",
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
        label: "Fatal crashes - CRIS",
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
        label: "Fatal crashes - Law enforcement",
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
      // todo: "Other" sitch
    ],
  },
  {
    id: "geography_filter_card",
    label: "Jurisdiction",
    groupOperator: "_or",
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
    ],
  },
  {
    id: "internal_filters",
    label: "Internal",
    groupOperator: "_or",
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
    ],
  },
];

export const crashesListViewQueryConfig: QueryConfig = {
  columns,
  tableName: "crashes_list_view",
  limit: DEFAULT_QUERY_LIMIT,
  offset: 0,
  sortColName: "crash_timestamp",
  sortAsc: false,
  searchFilter: {
    id: "search",
    value: "",
    column: "record_locator",
    operator: "_ilike",
    wildcard: true,
  },
  searchFields: [
    { label: "Crash ID", value: "record_locator" },
    { label: "Case ID", value: "case_id" },
    { label: "Address", value: "address_primary" },
  ],
  dateFilter: {
    mode: "ytd",
    column: "crash_timestamp",
    filters: makeDateFilters("crash_timestamp", {
      start: getStartOfYearDate(),
      end: null,
    }),
  },
  filterCards: crashesListViewfilterCards,
};
