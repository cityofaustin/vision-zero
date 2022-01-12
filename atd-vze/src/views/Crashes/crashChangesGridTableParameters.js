import React from "react";

export const crashChangesGridTableColumns = {
  record_id: {
    primary_key: true,
    searchable: true,
    sortable: true,
    label_search: "Search by Record ID",
    label_table: "Record ID",
    type: "int",
  },
  change_id: {
    searchable: false,
    sortable: false,
    label_table: "Change ID",
    type: "int",
  },
  record_json: {
    searchable: false,
    sortable: false,
    label_table: "Suspected Serious Injury Count / Crash Fatality Flag",
    type: "string",
    filter: values => {
      const parsedValues = JSON.parse(values);
      return (<>
{/*        <span>{`Suspected Serious Injury Count: ${parsedValues.sus_serious_injry_cnt}` }
        </span>
        <span>{`Crash Fatality Flag: ${parsedValues.crash_fatal_fl}`}</span>*/}
        {`${parsedValues.sus_serious_injry_cnt} / ${parsedValues.crash_fatal_fl} `}
         </>);
    },
  },
  // record_json: {
  //   searchable: false,
  //   sortable: true,
  //   label_table: "Crash Fatality",
  //   type: "string",
  //   filter: values => {
  //     const parsedValues = JSON.parse(values);
  //     return parsedValues.crash_fatal_fl;
  //   },
  // },
  created_timestamp: {
    searchable: false,
    sortable: true,
    label_table: "Create Date",
    type: "date_iso",
  },
  "status { description }": {
    searchable: false,
    sortable: true,
    label_table: "Status",
    type: "string",
  },
};
