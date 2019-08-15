import React, { Component } from "react";
import { Card, CardBody, CardHeader, Col, Row, Table } from "reactstrap";
import { withApollo } from "react-apollo";
import { useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import crashDataMap from "./crashDataMap";

const GET_CRASH = gql`
  query FindCrash($crashId: Int) {
    atd_txdot_crashes(where: { crash_id: { _eq: $crashId } }) {
      active_school_zone_fl
      approval_date
      approved_by
      at_intrsct_fl
      case_id
      crash_date
      crash_fatal_fl
      crash_id
      crash_sev_id
      crash_speed_limit
      crash_time
      day_of_week
      death_cnt
      fhe_collsn_id
      geocode_date
      geocode_provider
      geocode_status
      geocoded
      hwy_nbr
      hwy_sfx
      hwy_sys
      intrsct_relat_id
      investigator_narrative
      is_retired
      last_update
      latitude
      latitude_confirmed
      latitude_geocoded
      light_cond_id
      longitude
      longitude_confirmed
      longitude_geocoded
      non_injry_cnt
      nonincap_injry_cnt
      obj_struck_id
      onsys_fl
      position
      poss_injry_cnt
      private_dr_fl
      qa_status
      road_constr_zone_fl
      road_type_id
      rpt_block_num
      rpt_city_id
      rpt_hwy_num
      rpt_hwy_sfx
      rpt_latitude
      rpt_longitude
      rpt_outside_city_limit_fl
      rpt_rdwy_sys_id
      rpt_road_part_id
      rpt_sec_block_num
      rpt_sec_hwy_num
      rpt_sec_hwy_sfx
      rpt_sec_rdwy_sys_id
      rpt_sec_road_part_id
      rpt_sec_street_desc
      rpt_sec_street_name
      rpt_sec_street_pfx
      rpt_sec_street_sfx
      rpt_street_name
      rpt_street_pfx
      rpt_street_sfx
      rr_relat_fl
      schl_bus_fl
      street_name
      street_name_2
      street_nbr
      street_nbr_2
      sus_serious_injry_cnt
      toll_road_fl
      tot_injry_cnt
      traffic_cntl_id
      unkn_injry_cnt
      wthr_cond_id
    }
  }
`;

function Crash(props) {
  const crashId = props.match.params.id;
  const { loading, error, data } = useQuery(GET_CRASH, {
    variables: { crashId }
  });

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  console.log(data);

  const {
    active_school_zone_fl,
    approved_by,
    approval_date,
    at_intrsct_fl,
    case_id,
    crash_date,
    crash_fatal_fl,
    crash_id,
    crash_sev_id,
    crash_speed_limit,
    crash_time,
    day_of_week,
    death_cnt,
    fhe_collsn_id,
    geocode_date,
    geocode_provider,
    geocode_status,
    geocoded,
    hwy_nbr,
    hwy_sfx,
    hwy_sys,
    intrsct_relat_id,
    investigator_narrative,
    is_retired,
    last_update,
    latitude,
    latitude_confirmed,
    latitude_geocoded,
    light_cond_id,
    longitude,
    longitude_confirmed,
    longitude_geocoded,
    non_injry_cnt,
    nonincap_injry_cnt,
    obj_struck_id,
    onsys_fl,
    position,
    poss_injry_cnt,
    private_dr_fl,
    qa_status,
    road_constr_zone_fl,
    road_type_id,
    rpt_block_num,
    rpt_city_id,
    rpt_hwy_num,
    rpt_hwy_sfx,
    rpt_latitude,
    rpt_longitude,
    rpt_outside_city_limit_fl,
    rpt_rdwy_sys_id,
    rpt_road_part_id,
    rpt_sec_block_num,
    rpt_sec_hwy_num,
    rpt_sec_hwy_sfx,
    rpt_sec_rdwy_sys_id,
    rpt_sec_road_part_id,
    rpt_sec_street_desc,
    rpt_sec_street_name,
    rpt_sec_street_pfx,
    rpt_sec_street_sfx,
    rpt_street_name,
    rpt_street_pfx,
    rpt_street_sfx,
    rr_relat_fl,
    schl_bus_fl,
    street_name,
    street_name_2,
    street_nbr,
    street_nbr_2,
    sus_serious_injry_cnt,
    toll_road_fl,
    tot_injry_cnt,
    traffic_cntl_id,
    unkn_injry_cnt,
    wthr_cond_id
  } = data.atd_txdot_crashes[0];

  console.log(crashDataMap);
  let hi = crashDataMap;
  debugger;

  return (
    <div className="animated fadeIn">
      <Row>
        <Col lg={6}>
          <Card>
            <CardHeader>
              <strong>
                <i className="icon-info pr-1" />
                {`${crash_id} -- ${rpt_street_pfx} ${rpt_street_name} ${rpt_street_sfx}`}
              </strong>
            </CardHeader>
            <CardBody>
              <Table responsive striped hover>
                <tbody>
                  {Object.keys(crashDataMap).map((item, i) => {
                    console.log(hi[item]);
                    return (
                      <tr key={`crashData-${i}`}>
                        <td>{`${crashDataMap[item]}:`}</td>
                        <td>
                          <strong>{data.atd_txdot_crashes[0][item]}</strong>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default withApollo(Crash);
