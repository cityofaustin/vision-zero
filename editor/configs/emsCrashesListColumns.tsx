import Link from "next/link";
import {
  FaCircleCheck,
  FaTriangleExclamation,
  FaRegCircleQuestion,
} from "react-icons/fa6";
import AlignedLabel from "@/components/AlignedLabel";
import {
  formatIsoDate,
  formatDollars,
  formatTime,
  formatYesNoString,
} from "@/utils/formatters";
import { ColDataCardDef } from "@/types/types";
import { EmsCrashesListRow } from "@/types/combinedEmsCrash";

const formatRecordTableName = (value: unknown) => {
  switch (value) {
    case "crashes":
      return "Crash report";
    case "ems__incidents":
      return "EMS incident";
    default:
      return "";
  }
};

const formatInjuryMatchStatus = (value: unknown) => {
  switch (value) {
    case "fully_matched":
      return (
        <AlignedLabel>
          <FaCircleCheck className="text-success me-2 fs-5" />
          <span>Fully matched</span>
        </AlignedLabel>
      );
    case "unmatched":
      return (
        <AlignedLabel>
          <FaTriangleExclamation className="text-secondary me-2" />
          <span>Unmatched</span>
        </AlignedLabel>
      );
    case "mixed":
      return (
        <AlignedLabel>
          <FaRegCircleQuestion className="text-secondary me-2" />
          <span>Partially matched</span>
        </AlignedLabel>
      );
    default:
      return "";
  }
};

export const emsCrashesListColumns: ColDataCardDef<EmsCrashesListRow>[] = [
  {
    path: "record_locator",
    label: "Record ID",
    sortable: true,
    fetchAlways: true,
    valueRenderer: (record: EmsCrashesListRow) => (
      <Link href={record.details_page} prefetch={false}>
        {record.record_locator}
      </Link>
    ),
  },
  {
    path: "record_table_name",
    label: "Source",
    sortable: true,
    valueFormatter: formatRecordTableName,
  },
  {
    path: "case_id",
    label: "Case ID",
    sortable: true,
  },
  {
    path: "record_responding_agency",
    label: "Agency",
    sortable: true,
    defaultHidden: true,
  },
  {
    path: "record_timestamp",
    label: "Date",
    sortable: true,
    style: { minWidth: "8rem" },
    valueFormatter: formatIsoDate,
    fetchAlways: true,
  },
  {
    path: "record_timestamp",
    label: "Time",
    sortable: false,
    defaultHidden: true,
    valueFormatter: formatTime,
    style: { minWidth: "6rem" },
  },
  {
    path: "record_day_of_week",
    label: "Day of week",
    defaultHidden: true,
    sortable: true,
  },
  {
    path: "record_date_ct",
    label: "record_date_ct",
    exportOnly: true,
  },
  {
    path: "record_time_ct",
    label: "record_time_ct",
    exportOnly: true,
  },
  {
    path: "record_address",
    label: "Address",
    sortable: true,
    fetchAlways: true,
  },
  {
    path: "units_involved",
    label: "Units involved",
    defaultHidden: true,
  },
  {
    path: "in_austin_full_purpose",
    label: "In Austin Full Purpose Jurisdiction",
    defaultHidden: true,
    valueFormatter: formatYesNoString,
  },
  {
    path: "has_ems_override",
    label: "Has EMS override",
    defaultHidden: true,
    valueFormatter: formatYesNoString,
  },
  {
    path: "injured_people_match_status",
    label: "Injury match status",
    defaultHidden: true,
    valueRenderer: (record: EmsCrashesListRow) =>
      formatInjuryMatchStatus(record.injured_people_match_status),
  },
  {
    path: "vz_fatality_count",
    label: "Fatalities",
    sortable: true,
  },
  {
    path: "sus_serious_injry_count",
    label: "Serious Injuries",
    sortable: true,
  },
  {
    path: "nonincap_injry_count",
    label: "Minor injuries",
    defaultHidden: true,
    sortable: true,
  },
  {
    path: "tot_injry_count",
    label: "Total injuries",
    defaultHidden: true,
    sortable: true,
  },
  {
    path: "unkn_injry_count",
    label: "unkn_injry_count",
    exportOnly: true,
  },
  {
    path: "non_injry_count",
    label: "non_injry_count",
    exportOnly: true,
  },
  {
    path: "poss_injry_count",
    label: "poss_injry_count",
    exportOnly: true,
  },
  {
    path: "fatality_count",
    label: "fatality_count",
    exportOnly: true,
  },
  {
    path: "law_enf_fatality_count",
    label: "law_enf_fatality_count",
    exportOnly: true,
  },
  {
    path: "cris_fatality_count",
    label: "cris_fatality_count",
    exportOnly: true,
  },
  {
    path: "motor_vehicle_fatality_count",
    label: "motor_vehicle_fatality_count",
    exportOnly: true,
  },
  {
    path: "motor_vehicle_sus_serious_injry_count",
    label: "motor_vehicle_sus_serious_injry_count",
    exportOnly: true,
  },
  {
    path: "motorcycle_fatality_count",
    label: "motorcycle_fatality_count",
    exportOnly: true,
  },
  {
    path: "motorcycle_sus_serious_count",
    label: "motorcycle_sus_serious_count",
    exportOnly: true,
  },
  {
    path: "bicycle_fatality_count",
    label: "bicycle_fatality_count",
    exportOnly: true,
  },
  {
    path: "bicycle_sus_serious_injry_count",
    label: "bicycle_sus_serious_injry_count",
    exportOnly: true,
  },
  {
    path: "pedestrian_fatality_count",
    label: "pedestrian_fatality_count",
    exportOnly: true,
  },
  {
    path: "pedestrian_sus_serious_injry_count",
    label: "pedestrian_sus_serious_injry_count",
    exportOnly: true,
  },
  {
    path: "micromobility_fatality_count",
    label: "micromobility_fatality_count",
    exportOnly: true,
  },
  {
    path: "micromobility_sus_serious_injry_count",
    label: "micromobility_sus_serious_injry_count",
    exportOnly: true,
  },
  {
    path: "other_fatality_count",
    label: "other_fatality_count",
    exportOnly: true,
  },
  {
    path: "other_sus_serious_injry_count",
    label: "other_sus_serious_injry_count",
    exportOnly: true,
  },
  {
    path: "crash_injry_sev_desc",
    label: "crash_injry_sev_desc",
    exportOnly: true,
  },
  {
    path: "crash_injry_sev_id",
    label: "crash_injry_sev_id",
    exportOnly: true,
  },
  {
    path: "years_of_life_lost",
    label: "Years of life lost",
    defaultHidden: true,
    sortable: true,
  },
  {
    path: "est_comp_cost_crash_based",
    label: "Est Comp Cost",
    sortable: true,
    valueFormatter: formatDollars,
  },
  {
    path: "est_total_person_comp_cost",
    label: "est_total_person_comp_cost",
    exportOnly: true,
    valueFormatter: formatDollars,
  },
  {
    path: "latitude",
    label: "latitude",
    exportOnly: true,
    fetchAlways: true,
  },
  {
    path: "longitude",
    label: "longitude",
    exportOnly: true,
    fetchAlways: true,
  },
  {
    path: "location_id",
    label: "location_id",
    exportOnly: true,
  },
  {
    path: "record_id",
    label: "record_id",
    exportOnly: true,
  },
  {
    path: "details_page",
    label: "details_page",
    fetchAlways: true,
    exportOnly: true,
  },
];
