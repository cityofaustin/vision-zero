import { ColDataCardDef } from "@/types/types";
import { VzIncidentRecord } from "@/types/vzIncidentRecord";
import {
  RecordTypeBadge,
  RECORD_TYPE_BADGES,
} from "@/components/RecordTypeBadge";

export const vzIncidentRecordColumns: ColDataCardDef<VzIncidentRecord>[] = [
  {
    path: "record_table_name",
    label: "Type",
    valueRenderer: (record: VzIncidentRecord) => {
      let badgeConfig;
      let agency = record.record_responding_agency || "";

      if (record.record_table_name === "crashes") {
        badgeConfig = RECORD_TYPE_BADGES.crashes;
      } else if (["afd", "ems", "apd"].indexOf(agency) > -1) {
        badgeConfig = RECORD_TYPE_BADGES[agency];
      } else {
        // should never happen / not possible based on view def
        badgeConfig = RECORD_TYPE_BADGES.crashes;
      }
      return <RecordTypeBadge {...badgeConfig} />;
    },
  },
    {
    path: "record_address",
    label: "Address",
  },
  {
    path: "record_timestamp",
    label: "Address",
  },
];
