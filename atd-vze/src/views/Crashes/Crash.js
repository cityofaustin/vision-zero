import React from "react";
import { Card, CardBody, CardHeader, Col, Row, Table } from "reactstrap";
import { withApollo } from "react-apollo";
import { useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import crashDataMap from "./crashDataMap";
import CrashCollapses from "./CrashCollapses";
import CrashMap from "./CrashMap";

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
    atd_txdot_primaryperson(where: { crash_id: { _eq: $crashId } }) {
      prsn_age
      prsn_injry_sev_id
      drvr_zip
      drvr_city_name
    }
    atd_txdot_person(where: { crash_id: { _eq: $crashId } }) {
      prsn_age
      prsn_injry_sev_id
    }
    atd_txdot_units(where: { crash_id: { _eq: $crashId } }) {
      unit_desc_id
      unit_nbr
      contrib_factr_1_id
      veh_make_id
      veh_mod_id
      veh_mod_year
    }
    atd_txdot_charges(where: { crash_id: { _eq: $crashId } }) {
      citation_nbr
      charge_cat_id
      charge
      id
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

  return (
    <div className="animated fadeIn">
      <Row>
        <Col lg={6}>
          {crashDataMap.map(section => {
            return (
              <Card key={section.title}>
                <CardHeader>{section.title}</CardHeader>
                <CardBody>
                  <Table responsive striped hover>
                    <tbody>
                      {Object.keys(section.fields).map((field, i) => {
                        return (
                          <tr key={i}>
                            <td>{`${section.fields[field]}:`}</td>
                            <td>
                              <strong>
                                {data.atd_txdot_crashes[0][field]}
                              </strong>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </CardBody>
              </Card>
            );
          })}
        </Col>

        <Col lg={6}>
          <div className="mb-4">
            <Card>
              <CardHeader>Crash Location</CardHeader>
              <CardBody>
                <CrashMap data={data.atd_txdot_crashes[0]} />
              </CardBody>
            </Card>
          </div>
          <CrashCollapses data={data} />
        </Col>
      </Row>
    </div>
  );
}

export default withApollo(Crash);
