import Link from "next/link";
import { getInjuryColorClass } from "@/utils/people";
import { ColDataCardDef } from "@/types/types";
import { PeopleListRow } from "@/types/peopleList";
import PersonNameField from "@/components/PersonNameField";
import { formatIsoDateTime } from "@/utils/formatters";
import { commonValidations } from "@/utils/formHelpers";
import { formatCrashMatchStatus } from "@/configs/emsColumns";

export const ALL_PEOPLE_COLUMNS = {
  id: { path: "id", label: "ID", sortable: true },
  drvr_city_name: {
    path: "drvr_city_name",
    label: "City",
    sortable: true,
  },
  unit_nbr: {
    path: "unit_nbr",
    label: "Unit",
    sortable: true,
  },
  unit_type: {
    path: "unit.unit_desc.label",
    label: "Travel mode",
    sortable: true,
  },
  injry_sev: {
    path: "injry_sev.label",
    label: "Injury severity",
    editable: true,
    inputType: "select",
    relationship: {
      tableSchema: "lookups",
      tableName: "injry_sev",
      foreignKey: "prsn_injry_sev_id",
      idColumnName: "id",
      labelColumnName: "label",
    },
    valueRenderer: (record) => {
      const value = record.injry_sev?.label || "";
      const className = `${getInjuryColorClass(value)} px-2 py-1 rounded`;
      return <span className={className}>{value}</span>;
    },
    sortable: true,
  },
  prsn_nbr: {
    path: "prsn_nbr",
    label: "Person",
    sortable: true,
  },
  prsn_type: {
    path: "prsn_type.label",
    label: "Type",
    editable: true,
    inputType: "select",
    relationship: {
      tableSchema: "lookups",
      tableName: "prsn_type",
      foreignKey: "prsn_type_id",
      idColumnName: "id",
      labelColumnName: "label",
    },
    sortable: true,
  },
  occpnt_pos: {
    path: "occpnt_pos.label",
    label: "Position in vehicle",
    editable: true,
    inputType: "select",
    relationship: {
      tableSchema: "lookups",
      tableName: "occpnt_pos",
      foreignKey: "prsn_occpnt_pos_id",
      idColumnName: "id",
      labelColumnName: "label",
    },
    sortable: true,
  },
  prsn_age: {
    path: "prsn_age",
    label: "Age",
    editable: true,
    inputType: "number",
    inputOptions: {
      validate: commonValidations.isNullableInteger,
      min: { value: 0, message: "Age cannot be negative" },
    },
    sortable: true,
  },
  prsn_taken_to: {
    path: "prsn_taken_to",
    label: "Transported to",
    sortable: true,
  },
  gndr: {
    path: "gndr.label",
    label: "Sex",
    editable: true,
    inputType: "select",
    relationship: {
      tableSchema: "lookups",
      tableName: "gndr",
      foreignKey: "prsn_gndr_id",
      idColumnName: "id",
      labelColumnName: "label",
    },
    sortable: true,
  },
  drvr_ethncty: {
    path: "drvr_ethncty.label",
    label: "Race/Ethnicity",
    editable: true,
    inputType: "select",
    relationship: {
      tableSchema: "lookups",
      tableName: "drvr_ethncty",
      foreignKey: "prsn_ethnicity_id",
      idColumnName: "id",
      labelColumnName: "label",
    },
    sortable: true,
  },
  drvr_zip: {
    path: "drvr_zip",
    label: "Zip",
    editable: true,
    inputType: "text",
    inputOptions: {
      validate: commonValidations.isNullableZipCode,
    },
    sortable: true,
  },
  prsn_exp_homelessness: {
    path: "prsn_exp_homelessness",
    label: "Suspected unhoused",
    inputType: "yes_no",
    editable: true,
    sortable: true,
  },
  prsn_last_name: {
    path: "prsn_last_name",
    label: "Name",
    editable: true,
    valueFormatter: (value, record) => {
      const nameFields = [
        record.prsn_first_name,
        record.prsn_mid_name,
        record.prsn_last_name,
      ];
      // filter out null fields then join into a string
      const displayName = nameFields.filter((n) => n).join(" ");
      return displayName;
    },
    customEditComponent: (record, onCancel, mutation, onSaveCallback) => (
      <PersonNameField
        record={record}
        onCancel={onCancel}
        mutation={mutation}
        onSaveCallback={onSaveCallback}
      />
    ),
  },
  case_id: {
    path: "crash.case_id",
    label: "Case ID",
    sortable: true,
  },
  crash_timestamp: {
    path: "crash_timestamp",
    label: "Crash date",
    valueFormatter: formatIsoDateTime,
    sortable: true,
  },
  address_display: {
    path: "crash.address_display",
    label: "Address",
    sortable: true,
  },
  record_locator: {
    path: "crash.record_locator",
    label: "Crash ID",
    sortable: true,
    valueRenderer: (record: PeopleListRow) =>
      record.crash?.record_locator ? (
        <Link href={`/crashes/${record.crash.record_locator}`} prefetch={false}>
          {record.crash.record_locator}
        </Link>
      ) : (
        ""
      ),
  },
  ems_match_status: {
    path: "ems_pcr.id",
    label: "EMS match status",
    valueRenderer: (record) =>
      formatCrashMatchStatus(
        record.ems_pcr?.person_match_status || "unmatched"
      ),
  },
} satisfies Record<string, ColDataCardDef<PeopleListRow>>;
