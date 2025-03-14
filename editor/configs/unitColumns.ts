import { ColDataCardDef } from "@/types/types";
import { Unit } from "@/types/unit";

export const ALL_UNIT_COLUMNS = {
  unit_nbr: {
    path: "unit_nbr",
    label: "Unit",
  },
  unit_desc: {
    path: "unit_desc.label",
    label: "Type",
    editable: true,
    inputType: "select",
    relationship: {
      tableSchema: "lookups",
      tableName: "unit_desc",
      foreignKey: "unit_desc_id",
      idColumnName: "id",
      labelColumnName: "label",
    },
  },
  veh_body_styl: {
    path: "veh_body_styl.label",
    label: "Body style",
    editable: true,
    inputType: "select",
    relationship: {
      tableSchema: "lookups",
      tableName: "veh_body_styl",
      foreignKey: "veh_body_styl_id",
      idColumnName: "id",
      labelColumnName: "label",
    },
  },
  veh_mod_year: {
    path: "veh_mod_year",
    label: "Year",
  },
  veh_make: {
    path: "veh_make.label",
    label: "Make",
    editable: false,
    inputType: "select",
  },
  veh_mod: {
    path: "veh_mod.label",
    label: "Model",
    editable: false,
    inputType: "select",
  },
  trvl_dir: {
    path: "trvl_dir.label",
    label: "Direction",
    editable: true,
    inputType: "select",
    relationship: {
      tableSchema: "lookups",
      tableName: "trvl_dir",
      foreignKey: "veh_trvl_dir_id",
      idColumnName: "id",
      labelColumnName: "label",
    },
  },
  movt: {
    path: "movt.label",
    label: "Movement",
    editable: true,
    inputType: "select",
    relationship: {
      tableSchema: "lookups",
      tableName: "movt",
      foreignKey: "movement_id",
      idColumnName: "id",
      labelColumnName: "label",
    },
  },
  contrib_factr: {
    path: "contrib_factr.label",
    label: "Contributing factors",
    editable: false,
    inputType: "select",
    valueFormatter: (value, record, column) => {
      console.log(record);
      const contribFactors = [
        record.contrib_factr?.label,
        record.contrib_factr_2?.label,
        // record.contrib_factr_3_id,
      ];
      // const possibleContribFactors = [
      //   record.contrib_factr_p1_id,
      //   record.contrib_factr_p2_id,
      // ];
      // filter out null fields then join into a string
      const displayName = contribFactors.filter((n) => n).join("\r\n");
      return displayName;
    },
  },
} satisfies Record<string, ColDataCardDef<Unit>>;
