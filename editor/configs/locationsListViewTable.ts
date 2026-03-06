import { QueryConfig, FilterGroup } from "@/types/queryBuilder";
import { DEFAULT_QUERY_LIMIT } from "@/utils/constants";

const locationsListViewFiltercards: FilterGroup[] = [
  // area_eng_areas
  {
    id: "area_eng_areas_filter_card",
    label: "Area engineer",
    groupOperator: "_or",
    filterGroups: [
      {
        id: "area_eng_areas_north",
        label: "North",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "area_eng_areas_north",
            column: "area_eng_areas",
            operator: "_contains",
            value: ["NORTH"],
          },
        ],
      },
      {
        id: "area_eng_areas_central",
        label: "Central",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "area_eng_areas_central",
            column: "area_eng_areas",
            operator: "_contains",
            value: ["CENTRAL"],
          },
        ],
      },
      {
        id: "area_eng_areas_south",
        label: "South",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "area_eng_areas_south",
            column: "area_eng_areas",
            operator: "_contains",
            value: ["SOUTH"],
          },
        ],
      },
    ],
  },
  // signal_eng_areas
  {
    id: "signal_eng_areas_filter_card",
    label: "Signal engineer",
    groupOperator: "_or",
    filterGroups: [
      {
        id: "signal_eng_areas_northeast",
        label: "Northeast",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "signal_eng_areas_northeast",
            column: "signal_eng_areas",
            operator: "_contains",
            value: ["NORTHEAST"],
          },
        ],
      },
      {
        id: "signal_eng_areas_northwest",
        label: "Northwest",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "signal_eng_areas_northwest",
            column: "signal_eng_areas",
            operator: "_contains",
            value: ["NORTHWEST"],
          },
        ],
      },
      {
        id: "signal_eng_areas_central",
        label: "Central",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "signal_eng_areas_central",
            column: "signal_eng_areas",
            operator: "_contains",
            value: ["CENTRAL"],
          },
        ],
      },
      {
        id: "signal_eng_areas_soutb",
        label: "South",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "signal_eng_areas_south",
            column: "signal_eng_areas",
            operator: "_contains",
            value: ["SOUTH"],
          },
        ],
      },
    ],
  },
  // is_signalized
  {
    id: "is_signalized",
    label: "Signalized intersection",
    groupOperator: "_or",
    filterGroups: [
      {
        id: "is_signalized_yes",
        label: "Yes",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "is_signalized_yes",
            column: "is_signalized",
            operator: "_eq",
            value: true,
          },
        ],
      },
      {
        id: "is_signalized_no",
        label: "No",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "is_signalized_no",
            column: "is_signalized",
            operator: "_neq",
            value: true,
          },
        ],
      },
    ],
  },
  // street levels
  {
    id: "street_levels_filter_card",
    label: "Street level",
    groupOperator: "_or",
    filterGroups: [
      {
        id: "street_levels_1",
        label: "1 - Local streets",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "street_levels_1",
            column: "street_levels",
            operator: "_contains",
            value: [1],
          },
        ],
      },
      {
        id: "street_levels_2",
        label: "2 - Collector streets",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "street_levels_2",
            column: "street_levels",
            operator: "_contains",
            value: [2],
          },
        ],
      },
      {
        id: "street_levels_3",
        label: "3 - Minor or major arterials",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "street_levels_3",
            column: "street_levels",
            operator: "_contains",
            value: [3],
          },
        ],
      },
      {
        id: "street_levels_4",
        label: "4 - Major arterials or frontage roads",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "street_levels_4",
            column: "street_levels",
            operator: "_contains",
            value: [1],
          },
        ],
      },
      {
        id: "street_levels_5",
        label: "5 -  Highways and freeways ",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "street_levels_5",
            column: "street_levels",
            operator: "_contains",
            value: [5],
          },
        ],
      },
    ],
  },
  {
    id: "high_inj_net",
    label: "High injury network",
    groupOperator: "_and",
    filterGroups: [
      {
        id: "high_inj_net_true",
        label: "High injury network locations only",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "high_inj_net_true",
            column: "is_hin",
            operator: "_eq",
            value: true,
          },
        ],
      },
    ],
  },
  // jurisdiction
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
            column: "council_districts",
            operator: "_is_null",
            value: false,
          },
        ],
      },
      {
        id: "location_group",
        label: 'Include "Level 5" polygons',
        groupOperator: "_and",
        enabled: true,
        inverted: true,
        filters: [
          {
            id: "location_group",
            column: "location_group",
            operator: "_eq",
            value: 1,
          },
        ],
      },
    ],
  },
  // council district
  {
    id: "council_districts_filter_card",
    label: "Council district",
    groupOperator: "_or",
    filterGroups: [
      {
        id: "council_districts_1",
        label: "1",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "council_districts_1",
            column: "council_districts",
            operator: "_contains",
            value: [1],
          },
        ],
      },
      {
        id: "council_districts_2",
        label: "2",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "council_districts_2",
            column: "council_districts",
            operator: "_contains",
            value: [2],
          },
        ],
      },
      {
        id: "council_districts_3",
        label: "3",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "council_districts_3",
            column: "council_districts",
            operator: "_contains",
            value: [3],
          },
        ],
      },
      {
        id: "council_districts_4",
        label: "4",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "council_districts_4",
            column: "council_districts",
            operator: "_contains",
            value: [1],
          },
        ],
      },
      {
        id: "council_districts_5",
        label: "5",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "council_districts_5",
            column: "council_districts",
            operator: "_contains",
            value: [5],
          },
        ],
      },
{
        id: "council_districts_6",
        label: "6",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "council_districts_6",
            column: "council_districts",
            operator: "_contains",
            value: [6],
          },
        ],
      },
{
        id: "council_districts_7",
        label: "7",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "council_districts_7",
            column: "council_districts",
            operator: "_contains",
            value: [7],
          },
        ],
      },
{
        id: "council_districts_8",
        label: "8",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "council_districts_5",
            column: "council_districts",
            operator: "_contains",
            value: [8],
          },
        ],
      },
{
        id: "council_districts_9",
        label: "9",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "council_districts_5",
            column: "council_districts",
            operator: "_contains",
            value: [9],
          },
        ],
      },
{
        id: "council_districts_10",
        label: "10",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "council_districts_10",
            column: "council_districts",
            operator: "_contains",
            value: [10],
          },
        ],
      },
    ],
  },
];

export const locationsListViewQueryConfig: QueryConfig = {
  _version: 6,
  exportable: true,
  exportFilename: "locations",
  tableName: "locations_list_view",
  limit: DEFAULT_QUERY_LIMIT,
  offset: 0,
  sortColName: "cr3_crash_count",
  sortAsc: false,
  searchFilter: {
    id: "search",
    value: "",
    column: "location_id",
    operator: "_ilike",
    wildcard: true,
  },
  searchFields: [
    { label: "Location ID", value: "location_id" },
    { label: "Location", value: "location_name" },
  ],
  filterCards: locationsListViewFiltercards,
};
