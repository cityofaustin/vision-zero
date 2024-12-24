import { ColDataCardDef } from "@/types/types";
import { Person } from "@/types/person";

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
        relationship: {
            tableSchema: "lookups",
            tableName: "injry_sev",
            foreignKey: "injry_sev_id",
            idColumnName: "id",
            labelColumnName: "label",
        },
    },
    prsn_type: {
        path: "prsn_type.label",
        label: "Type",
        // relationship: {
        //     tableSchema: "lookups",
        //     tableName: "prsn_type",
        //     foreignKey: "prsn_type_id",
        //     idColumnName: "id",
        //     labelColumnName: "label",
        // },
    },
    prsn_age: {
        path: "prsn_age",
        label: "Age",
    },
    gndr: {
        path: "gndr.label",
        label: "Sex",
        relationship: {
            tableSchema: "lookups",
            tableName: "gndr",
            foreignKey: "gndr_id",
            idColumnName: "id",
            labelColumnName: "label"
        }
    },
    drvr_ethncty: {
        path: "drvr_ethncty.label",
        label: "Race/Ethnicity",
        // relationship: {
        //     tableSchema: "lookups",
        //     tableName: "gndr",
        //     foreignKey: "gndr_id",
        //     idColumnName: "id",
        //     labelColumnName: "label"
        // }
    },
    drvr_zip: {
        path: "drvr_zip",
        label: "Zip"
    },
    prsn_exp_homelessness: {
        path: "prsn_exp_homelessness",
        label: "Suspected unhoused",
        inputType: "yes_no"
    }
} satisfies Record<string, ColDataCardDef<Person>>; // check satisfies

/*
  crash_pk: number;
  id: number;
  is_primary_person: boolean;
  prsn_first_name: string | null;
  prsn_last_name: string | null;
  prsn_mid_name: string | null;
*/