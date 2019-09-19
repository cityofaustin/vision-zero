import React from "react";
import { withApollo } from "react-apollo";

import GridTable from "../../Components/GridTable";

import gqlAbstract from "../../queries/gqlAbstract";

function LocationCrashes(props) {
  // Our initial query configuration
  let queryConf = {
    table: "atd_txdot_crashes",
    single_item: "crashes",
    columns: {
      crash_id: {
        primary_key: true,
        searchable: true,
        sortable: true,
        label_search: "Search by Crash ID",
        label_table: "Crash ID",
        type: "Int",
      },
      "location { location_id }": {
        searchable: false,
        sortable: true,
        label_table: "Location ID",
        type: "String",
      },
      case_id: {
        searchable: true,
        sortable: true,
        label_search: "Search by Case Number",
        label_table: "Case Number",
        type: "String",
      },
      crash_date: {
        searchable: false,
        sortable: true,
        label_table: "Crash Date",
        type: "Date",
      },
      rpt_street_name: {
        searchable: true,
        sortable: true,
        label_search: "Search by Street Name",
        label_table: "Street Name",
        type: "String",
      },
      tot_injry_cnt: {
        searchable: false,
        sortable: true,
        label_table: "Injury Count",
        type: "Int",
      },
      death_cnt: {
        searchable: false,
        sortable: true,
        label_table: "Death Count",
        type: "Date",
      },
      "units { body_style { veh_body_styl_desc } }": {
        searchable: false,
        sortable: false,
        label_table: "Unit Body Type",
        type: "String",
      },
    },
    order_by: {},
    where: {
      city_id: "_eq: 22",
      location: `location_id: {_eq: "${props.locationId}"}`,
    },
    limit: 25,
    offset: 0,

    initStartDate: "01/01/2000",
  };

  let crashesQuery = new gqlAbstract(queryConf);

  let customFilters = {
    grp_injuries: {
      icon: "cab",
      label: "Deaths & Injuries",
      filters: [
        {
          id: "dni_deaths",
          label: "Deaths",
          filter: {
            where: [{ death_cnt: "_gt: 0" }],
          },
        },
        {
          id: "dni_serious_injuries",
          label: "Serious Injuries",
          filter: {
            where: [{ sus_serious_injry_cnt: "_gt: 0" }],
          },
        },
        {
          id: "dni_non_fatal",
          label: "Non-Fatal Injuries",
          filter: {
            where: [{ nonincap_injry_cnt: "_gt: 0" }],
          },
        },
      ],
    },
    grp_geograph: {
      icon: "map-marker",
      label: "GeoGraphy",
      filters: [
        {
          id: "geo_no_coordinates",
          label: "No Latitude and Longitude provided",
          filter: {
            where: [
              { latitude: "_is_null: true" },
              { longitude: "_is_null: true" },
            ],
          },
        },
        {
          id: "geo_geocoded",
          label: "Has been Geo-Coded",
          filter: {
            where: [{ geocoded: '_eq: "Y"' }],
          },
        },
        {
          id: "geo_confirmed_coordinates",
          label: "Confirmed Coordinates",
          filter: {
            where: [
              { latitude_primary: "_is_null: false" },
              { longitude_primary: "_is_null: false" },
            ],
          },
        },
      ],
    },
    grp_case: {
      icon: "vcard-o",
      label: "Internal",
      filters: [
        {
          id: "int_nocasenumber",
          label: "No Case Number",
          filter: {
            where: [{ case_id: "_is_null: true" }],
          },
        },
      ],
    },
  };

  return (
    <GridTable
      query={crashesQuery}
      title={"Location Crashes"}
      filters={customFilters}
    />
  );
}

export default withApollo(LocationCrashes);
