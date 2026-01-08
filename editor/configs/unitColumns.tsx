import { ColDataCardDef } from "@/types/types";
import { Unit } from "@/types/unit";
import { commonValidations } from "@/utils/formHelpers";

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
    editable: true,
    inputType: "number",
    inputOptions: {
      validate: commonValidations.isNullableInteger,
      min: { value: 1900, message: "Year must be 1900 or later" },
      max: {
        value: new Date().getFullYear() + 1,
        message: "Year cannot be greater than current model year",
      },
    },
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
  veh_hnr_fl: {
    path: "veh_hnr_fl",
    label: "Hit and run",
    inputType: "yes_no",
  },
  contrib_factr: {
    path: "contrib_factr.label",
    label: "Contributing factors",
    editable: false,
    valueRenderer: (record) => {
      const primaryContribFactors = [
        record.contrib_factr,
        record.contrib_factr_2,
        record.contrib_factr_3,
      ];
      const possibleContribFactors = [
        record.contrib_factr_p1,
        record.contrib_factr_p2,
      ];
      return (
        <>
          {primaryContribFactors.map(
            (factor) =>
              !!factor?.label &&
              factor.id !== 0 && (
                <div key={factor.label}>
                  <span>
                    <strong>Primary: </strong>
                    {factor.label}
                  </span>
                </div>
              )
          )}
          {possibleContribFactors.map(
            (factor) =>
              !!factor?.label &&
              factor.id !== 0 && (
                <div key={factor.label}>
                  <span>
                    <strong>Possible: </strong>
                    {factor.label}
                  </span>
                </div>
              )
          )}
        </>
      );
    },
  },
} satisfies Record<string, ColDataCardDef<Unit>>;
