import Link from "next/link";
import { getInjuryColorClass } from "@/utils/people";
import { ColDataCardDef } from "@/types/types";
import { PeopleListRow } from "@/types/peopleList";
import PersonNameField from "@/components/PersonNameField";
import { formatAddresses, formatIsoDateTime } from "@/utils/formatters";

export const ALL_PEOPLE_COLUMNS = {
  drvr_city_name: {
    path: "drvr_city_name",
    label: "City",
  },
  unit_nbr: {
    path: "unit_nbr",
    label: "Unit",
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
      const value = record.injry_sev.label;
      const className = `${getInjuryColorClass(value)} px-2 py-1 rounded`;
      return <span className={className}>{value}</span>;
    },
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
  },
  prsn_age: {
    path: "prsn_age",
    label: "Age",
    editable: true,
    inputType: "number",
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
  },
  drvr_zip: {
    path: "drvr_zip",
    label: "Zip",
  },
  prsn_exp_homelessness: {
    path: "prsn_exp_homelessness",
    label: "Suspected unhoused",
    inputType: "yes_no",
    editable: true,
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
  },
  crash_timestamp: {
    path: "crash_timestamp",
    label: "Crash date",
    valueFormatter: formatIsoDateTime,
  },
  address_combined: {
    path: "crash.address_primary",
    label: "Address",
    valueRenderer: (record) => {
      return record.crash ? formatAddresses(record.crash) : "";
    },
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
} satisfies Record<string, ColDataCardDef<PeopleListRow>>;
