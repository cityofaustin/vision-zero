export const unitDataMap = [
  {
    title: "Unit",
    mutationVariableKey: "unitId",

    fields: {
      unit_nbr: {
        label: "Unit",
        editable: false,
      },
      unit_description: {
        label: "Type",
        editable: false,
        lookup_desc: "veh_unit_desc_desc",
      },
      body_style: {
        label: "Body Style",
        editable: false,
        lookup_desc: "veh_body_styl_desc",
      },
      veh_mod_year: {
        label: "Year",
        editable: false,
      },
      make: {
        label: "Make",
        editable: false,
        lookup_desc: "veh_make_desc",
      },
      model: {
        label: "Model",
        editable: false,
        lookup_desc: "veh_mod_desc",
      },
      travel_direction_desc: {
        edit_field_name: "travel_direction",
        label: "Direction",
        editable: true,
        format: "select",
        lookup_desc: "trvl_dir_desc",
        lookupOptions: "atd_txdot__trvl_dir_lkp",
        lookupPrefix: "trvl_dir",
        updateFieldKey: "travel_direction",
        mutationVariableKey: "unitId",
      },
      movement: {
        edit_field_name: "movement_id",
        label: "Movement",
        editable: true,
        format: "select",
        lookup_desc: "movement_desc",
        lookupOptions: "atd_txdot__movt_lkp",
        lookupPrefix: "movement",
        updateFieldKey: "movement_id",
        mutationVariableKey: "unitId",
      },
      death_cnt: {
        label: "Fatalities",
        editable: true,
        format: "text",
        mutationVariableKey: "unitId",
      },
      sus_serious_injry_cnt: {
        label: "Suspected Serious Injuries",
        editable: true,
        format: "text",
        mutationVariableKey: "unitId",
      },
      contributing_factor_1: {
        label: "Primary Contributing Factor",
        editable: false,
        lookup_desc: "contrib_factr_desc",
      },
    },
  },
];
