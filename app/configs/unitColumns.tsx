import { ColDataCardDef } from "@/types/types";
import { Unit } from "@/types/unit";

export const ALL_UNIT_COLUMNS: { [name: string]: ColDataCardDef<Unit> } = {
  unit_nbr: {
    path: "unit_nbr",
    label: "Unit",
  },
  unit_desc_id: {
    path: "unit_desc_id",
    label: "Type",
    editable: true,
    inputType: "select",
    relationshipName: "unit_desc",
    lookupTable: {
      tableSchema: "lookups",
      tableName: "unit_desc",
    },
  },
  veh_body_styl_id: {
    path: "veh_body_styl_id",
    label: "Body style",
    editable: true,
    inputType: "select",
    relationshipName: "veh_body_styl",
    lookupTable: {
      tableSchema: "lookups",
      tableName: "veh_body_styl",
    },
  },
  veh_mod_year: {
    path: "veh_mod_year",
    label: "Year",
  },
  veh_make_id: {
    path: "veh_make_id",
    label: "Make",
    editable: false,
    inputType: "select",
    relationshipName: "veh_make",
  },
  veh_mod_id: {
    path: "veh_mod_id",
    label: "Model",
    editable: false,
    inputType: "select",
    relationshipName: "veh_mod",
  },

  veh_trvl_dir_id: {
    path: "veh_trvl_dir_id",
    label: "Direction",
    editable: true,
    inputType: "select",
    relationshipName: "trvl_dir",
    lookupTable: {
      tableSchema: "lookups",
      tableName: "trvl_dir",
    },
  },

  movement_id: {
    path: "movement_id",
    label: "Movement",
    editable: true,
    inputType: "select",
    relationshipName: "movt",
    lookupTable: {
      tableSchema: "lookups",
      tableName: "movt",
    },
  },
  contrib_factr_1_id: {
    path: "contrib_factr_1_id",
    label: "Primary contrib factor",
    editable: true,
    inputType: "select",
    relationshipName: "contrib_factr",
    lookupTable: {
      tableSchema: "lookups",
      tableName: "contrib_factr",
    },
  },
};
