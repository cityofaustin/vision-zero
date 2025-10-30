import { getYearsAgoDate, makeDateFilters } from "@/utils/dates";
import { QueryConfig, FilterGroup } from "@/types/queryBuilder";
import { DEFAULT_QUERY_LIMIT } from "@/utils/constants";

const emsListViewFilterCards: FilterGroup[] = [
  {
    id: "travel_mode_filter_card",
    label: "Travel mode",
    groupOperator: "_or",
    filterGroups: [
      {
        id: "bicycle",
        label: "Bicycle",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "travel_mode",
            column: "travel_mode",
            operator: "_eq",
            value: "Bicycle",
          },
        ],
      },
      {
        id: "e_scooter",
        label: "E-Scooter",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "travel_mode",
            column: "travel_mode",
            operator: "_eq",
            value: "E-Scooter",
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
            id: "travel_mode",
            column: "travel_mode",
            operator: "_eq",
            value: "Motorcycle",
          },
        ],
      },
      {
        id: "motor_vehicle",
        label: "Motor vehicle",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "travel_mode",
            column: "travel_mode",
            operator: "_eq",
            value: "Motor Vehicle",
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
            id: "travel_mode",
            column: "travel_mode",
            operator: "_eq",
            value: "Pedestrian",
          },
        ],
      },
    ],
  },
  {
    id: "injury_sev_filter_card",
    label: "Injury severity",
    groupOperator: "_or",
    filterGroups: [
      {
        id: "fatal",
        label: "Fatal",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "fatal",
            column: "patient_injry_sev_id",
            operator: "_eq",
            value: 4,
          },
        ],
      },
      {
        id: "serious",
        label: "Serious",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "serious",
            column: "patient_injry_sev_id",
            operator: "_eq",
            value: 1,
          },
        ],
      },
      {
        id: "minor",
        label: "Minor",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "minor",
            column: "patient_injry_sev_id",
            operator: "_eq",
            value: 2,
          },
        ],
      },
      {
        id: "possible",
        label: "Possible",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "possible",
            column: "patient_injry_sev_id",
            operator: "_eq",
            value: 3,
          },
        ],
      },
      {
        id: "non_injured",
        label: "Not injured",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "non_injured",
            column: "patient_injry_sev_id",
            operator: "_eq",
            value: 5,
          },
        ],
      },
    ],
  },

  {
    id: "crash_match_status_filter_card",
    label: "Crash match status",
    groupOperator: "_or",
    filterGroups: [
      {
        id: "unmatched",
        label: "Unmatched",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "unmatched",
            column: "crash_match_status",
            operator: "_eq",
            value: "unmatched",
          },
        ],
      },
      {
        id: "matched_by_automation",
        label: "Matched automatically",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "matched_by_automation",
            column: "crash_match_status",
            operator: "_eq",
            value: "matched_by_automation",
          },
        ],
      },
      {
        id: "multiple_matches_by_automation",
        label: "Multiple matches",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "multiple_matches_by_automation",
            column: "crash_match_status",
            operator: "_eq",
            value: "multiple_matches_by_automation",
          },
        ],
      },
      {
        id: "matched_by_manual_qa",
        label: "Matched by review/QA",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "matched_by_manual_qa",
            column: "crash_match_status",
            operator: "_eq",
            value: "matched_by_manual_qa",
          },
        ],
      },
      {
        id: "unmatched_by_manual_qa",
        label: "Unmatched by review/QA",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "unmatched_by_manual_qa",
            column: "crash_match_status",
            operator: "_eq",
            value: "unmatched_by_manual_qa",
          },
        ],
      },
    ],
  },

  {
    id: "person_match_status_filter_card",
    label: "Person match status",
    groupOperator: "_or",
    filterGroups: [
      {
        id: "person_unmatched",
        label: "Unmatched",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "unmatched",
            column: "person_match_status",
            operator: "_eq",
            value: "unmatched",
          },
        ],
      },
      {
        id: "person_matched_by_automation",
        label: "Matched automatically",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "matched_by_automation",
            column: "person_match_status",
            operator: "_eq",
            value: "matched_by_automation",
          },
        ],
      },
      {
        id: "person_multiple_matches_by_automation",
        label: "Multiple matches",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "multiple_matches_by_automation",
            column: "person_match_status",
            operator: "_eq",
            value: "multiple_matches_by_automation",
          },
        ],
      },
      {
        id: "person_matched_by_manual_qa",
        label: "Matched by review/QA",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "matched_by_manual_qa",
            column: "person_match_status",
            operator: "_eq",
            value: "matched_by_manual_qa",
          },
        ],
      },
      {
        id: "person_unmatched_by_manual_qa",
        label: "Unmatched by review/QA",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "unmatched_by_manual_qa",
            column: "person_match_status",
            operator: "_eq",
            value: "unmatched_by_manual_qa",
          },
        ],
      },
      {
        id: "match_not_found_by_automation",
        label: "Not found by automation",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "match_not_found_by_automation",
            column: "person_match_status",
            operator: "_eq",
            value: "match_not_found_by_automation",
          },
        ],
      },
    ],
  },

  {
    id: "non_cr3_match_status_filter_card",
    label: "Non-CR3 match status",
    groupOperator: "_or",
    filterGroups: [
      {
        id: "noncr3_unmatched",
        label: "Unmatched",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "unmatched",
            column: "non_cr3_match_status",
            operator: "_eq",
            value: "unmatched",
          },
        ],
      },
      {
        id: "noncr3_matched_by_automation",
        label: "Matched automatically",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "Matched",
            column: "non_cr3_match_status",
            operator: "_eq",
            value: "matched_by_automation",
          },
        ],
      },
      {
        id: "noncr3_multiple_matches_by_automation",
        label: "Multiple matches",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "multiple_matches_by_automation",
            column: "non_cr3_match_status",
            operator: "_eq",
            value: "multiple_matches_by_automation",
          },
        ],
      },
    ],
  },
  {
    id: "geography_filter_card",
    label: "Jurisdiction",
    groupOperator: "_and",
    filterGroups: [
      {
        id: "austin_full_purpose",
        label: "Include outside Austin Full Purpose",
        groupOperator: "_and",
        enabled: true,
        inverted: true,
        filters: [
          {
            id: "austin_full_purpose",
            column: "austin_full_purpose",
            operator: "_eq",
            value: true,
          },
        ],
      },
    ],
  },
];

export const emsListViewQueryConfig: QueryConfig = {
  _version: 1,
  exportable: true,
  exportFilename: "ems_patient_care_records",
  tableName: "ems__incidents",
  limit: DEFAULT_QUERY_LIMIT,
  offset: 0,
  sortColName: "id",
  sortAsc: false,
  searchFilter: {
    id: "search",
    value: "",
    column: "incident_number",
    operator: "_ilike",
    wildcard: true,
  },
  searchFields: [
    { label: "Incident number", value: "incident_number" },
    { label: "Incident address", value: "incident_location_address" },
    { label: "APD Case IDs", value: "unparsed_apd_incident_numbers" },
  ],
  dateFilter: {
    mode: "1y",
    column: "incident_received_datetime",
    filters: makeDateFilters("incident_received_datetime", {
      start: getYearsAgoDate(1),
      end: null,
    }),
  },
  filterCards: emsListViewFilterCards,
};
