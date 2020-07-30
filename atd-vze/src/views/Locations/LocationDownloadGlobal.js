import React from "react";

import GridExportDataButton from "../../Components/GridExportDataButton";
import gqlAbstract from "../../queries/gqlAbstract";
import { useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";

const LocationDownloadGlobal = (props) => {

  const columnsToExport = `
      crash_id
      type
      location_id
      case_id
      crash_date
      crash_time
      day_of_week
      crash_sev_id
      longitude_primary
      latitude_primary
      address_confirmed_primary
      address_confirmed_secondary
      non_injry_cnt
      nonincap_injry_cnt
      poss_injry_cnt
      sus_serious_injry_cnt
      tot_injry_cnt
      death_cnt
      unkn_injry_cnt
      est_comp_cost
      collsn_desc
      travel_direction
      movement_desc
      veh_body_styl_desc
      veh_unit_desc_desc
    `;

  const crashesQuery = new gqlAbstract({
    table: "view_location_crashes_global",
    single_item: "crashes",
    showDateRange: false,
    columns: null,
    order_by: {},
    where: {
      location_id: `_eq: "${props.locationId}"`,
    },
    limit: 25,
    offset: 0,
  });

  const getGlobalCount = gql`
      query getGlobalCount($locationId: String) {
          view_location_crashes_global_aggregate (
              where: {location_id: {_eq: $locationId}},
              order_by: {}
          ) {
              aggregate {
                  count
              }
          }
      }
  `;

  const { data } = useQuery(getGlobalCount, {
    variables: { locationId: props.locationId },
  });


  return <>
    {data && Object.keys(data).includes("view_location_crashes_global_aggregate") && <GridExportDataButton
      query={crashesQuery}
      columnsToExport={columnsToExport}
      totalRecords={data.view_location_crashes_global_aggregate.aggregate.count}
      label={"Export Global Data"}
    />}

  </>;
}

export default LocationDownloadGlobal;
