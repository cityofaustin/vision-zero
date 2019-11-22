import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Table,
  Alert,
  Button,
} from "reactstrap";
import { withApollo } from "react-apollo";
import { useQuery } from "@apollo/react-hooks";

import CrashCollapses from "./CrashCollapses";
import CrashMap from "./Maps/CrashMap";
import CrashEditCoordsMap from "./Maps/CrashEditCoordsMap";
import Widget02 from "../Widgets/Widget02";
import CrashChangeLog from "./CrashChangeLog";
import CR3Record from "./CR3Record";
import DataTable from "../../Components/DataTable";
import { crashDataMap } from "./crashDataMap";

import "./crash.scss";

import { GET_CRASH, UPDATE_CRASH } from "../../queries/crashes";
import { GET_GEOCODERS } from "../../queries/lookups";

const calculateYearsLifeLost = people => {
  // Assume 75 year life expectancy,
  // Find the difference between person.prsn_age & 75
  // Sum over the list of ppl with .reduce
  return people.reduce((accumulator, person) => {
    let years = 0;
    if (person.injury_severity.injry_sev_desc === "KILLED") {
      let yearsLifeLost = 75 - Number(person.prsn_age);
      // What if the person is older than 75?
      // For now, so we don't have negative numbers,
      // Assume years of life lost is 0
      years = yearsLifeLost < 0 ? 0 : yearsLifeLost;
    }
    return accumulator + years;
  }, 0); // start with a count at 0 years
};

function Crash(props) {
  const crashId = props.match.params.id;
  const { loading, error, data, refetch } = useQuery(GET_CRASH, {
    variables: { crashId },
  });

  const { data: geocoderOptions } = useQuery(GET_GEOCODERS);

  const [editField, setEditField] = useState("");
  const [formData, setFormData] = useState({});
  const [isEditingCoords, setIsEditingCoords] = useState(false);

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  const createGeocoderAddressString = data => {
    const geocoderAddressFields = [
      "rpt_block_num",
      "rpt_street_pfx",
      "street_name",
      "rpt_street_pfx",
    ];
    let geocoderAddressString = "";
    geocoderAddressFields.forEach(field => {
      if (data.atd_txdot_crashes[0][field] !== null) {
        geocoderAddressString = geocoderAddressString.concat(
          data.atd_txdot_crashes[0][field] + " "
        );
      }
    });
    return geocoderAddressString;
  };

  const convertGeocoderToName = geocoderID => {
    const geocoders = geocoderOptions.atd_txdot_geocoders;
    const primaryLat = data.atd_txdot_crashes[0]["latitude_primary"];
    const primaryLong = data.atd_txdot_crashes[0]["longitude_primary"];

    const geocoderOption =
      geocoders && geocoders.find(option => option.geocoder_id === geocoderID);
    return primaryLat && primaryLong
      ? geocoderOption && geocoderOption.name
      : "No Primary Coordinates";
  };

  const handleInputChange = e => {
    const newFormState = Object.assign(formData, {
      [editField]: e.target.value,
      updated_by: localStorage.getItem("hasura_user_email"),
    });
    setFormData(newFormState);
  };

  const handleFieldUpdate = (e, fields, field) => {
    e.preventDefault();

    // Expose secondary field to update and add to mutation payload below
    let secondaryFormData = {};
    if (fields[field] && fields[field].secondaryFieldUpdate) {
      secondaryFormData = fields[field].secondaryFieldUpdate;
    }

    props.client
      .mutate({
        mutation: UPDATE_CRASH,
        variables: {
          crashId: crashId,
          changes: { ...formData, ...secondaryFormData },
        },
      })
      .then(res => refetch());

    setEditField("");
  };

  const handleButtonClick = (e, buttonParams, data) => {
    e.preventDefault();

    // Expose the field to mutate defined in crashDataMap
    // and the value from data using the dataPath, then mutate
    const fieldToUpdate = buttonParams.field;
    const fieldValue =
      data[buttonParams.dataTableName][0][buttonParams.dataPath];
    const buttonFormData = { [fieldToUpdate]: fieldValue };

    props.client
      .mutate({
        mutation: UPDATE_CRASH,
        variables: {
          crashId: crashId,
          changes: { ...formData, ...buttonFormData },
        },
      })
      .then(res => refetch());
  };

  const {
    apd_confirmed_death_count: deathCount,
    sus_serious_injry_cnt: seriousInjuryCount,
    latitude_primary: latitude,
    longitude_primary: longitude,
    address_confirmed_primary: primaryAddress,
    address_confirmed_secondary: secondaryAddress,
    cr3_stored_flag: cr3StoredFlag,
    geocode_provider: geocodeProvider,
  } = data.atd_txdot_crashes[0];

  const mapGeocoderAddress = createGeocoderAddressString(data);
  const yearsLifeLostCount = calculateYearsLifeLost(
    data.atd_txdot_primaryperson.concat(data.atd_txdot_person)
  );

  return (
    <div className="animated fadeIn">
      <Row>
        <Col>
          {primaryAddress && secondaryAddress ? (
            <h2 className="h2 mb-3">{`${primaryAddress} & ${secondaryAddress}`}</h2>
          ) : (
            <h2 className="h2 mb-3">{`${
              primaryAddress ? primaryAddress : "PRIMARY ADDRESS MISSING"
            } & ${
              secondaryAddress ? secondaryAddress : "SECONDARY ADDRESS MISSING"
            }`}</h2>
          )}
        </Col>
      </Row>
      <Row>
        <Col xs="12" sm="6" md="4">
          <Widget02
            header={`${deathCount === null ? "--" : deathCount}`}
            mainText="Fatalities"
            icon="fa fa-heartbeat"
            color="danger"
          />
        </Col>
        <Col xs="12" sm="6" md="4">
          <Widget02
            header={`${
              seriousInjuryCount === null ? "--" : seriousInjuryCount
            }`}
            mainText="Serious Injuries"
            icon="fa fa-medkit"
            color="warning"
          />
        </Col>
        <Col xs="12" sm="6" md="4">
          <Widget02
            header={`${
              yearsLifeLostCount === null ? "--" : yearsLifeLostCount
            }`}
            mainText="Years of Life Lost"
            icon="fa fa-hourglass-end"
            color="info"
          />
        </Col>
      </Row>
      <Row>
        <Col xs="12" md="6">
          <div className="mb-4">
            <Card>
              <CardHeader>
                <Row>
                  <Col>
                    Crash Location (ID:{" "}
                    {(data && data.atd_txdot_crash_locations.length > 0 && (
                      <>
                        <Link
                          to={`/locations/${
                            data.atd_txdot_crash_locations[0]["location_id"]
                          }`}
                        >
                          {data.atd_txdot_crash_locations[0]["location_id"]}
                        </Link>
                      </>
                    )) ||
                      "unassigned"}
                    )
                  </Col>
                  <Col>
                    {!isEditingCoords && (
                      <Button
                        color="primary"
                        style={{ float: "right" }}
                        onClick={e => setIsEditingCoords(!isEditingCoords)}
                      >
                        Edit Coordinates
                      </Button>
                    )}
                  </Col>
                </Row>
                <Row>
                  <Col>Source: {convertGeocoderToName(geocodeProvider)}</Col>
                </Row>
              </CardHeader>
              <CardBody>
                {(!latitude || !longitude) && (
                  <Alert color="danger">
                    Crash record is missing latitude and longitude values
                    required for map display.
                  </Alert>
                )}
                {!isEditingCoords && latitude && longitude ? (
                  <>
                    <CrashMap data={data.atd_txdot_crashes[0]} />
                    <Table responsive striped hover>
                      <tbody></tbody>
                    </Table>
                  </>
                ) : (
                  <>
                    <CrashEditCoordsMap
                      data={data.atd_txdot_crashes[0]}
                      mapGeocoderAddress={mapGeocoderAddress}
                      crashId={crashId}
                      refetchCrashData={refetch}
                      setIsEditingCoords={setIsEditingCoords}
                    />
                  </>
                )}
              </CardBody>
            </Card>
          </div>
        </Col>
        <Col>
          <CR3Record crashId={crashId} isCr3Stored={cr3StoredFlag === "Y"} />
          <CrashCollapses data={data} />
        </Col>
      </Row>
      <Row>
        <DataTable
          dataMap={crashDataMap}
          dataTable={"atd_txdot_crashes"}
          formData={formData}
          setEditField={setEditField}
          editField={editField}
          handleInputChange={handleInputChange}
          handleFieldUpdate={handleFieldUpdate}
          handleButtonClick={handleButtonClick}
          data={data}
        />
        <Col md="6">
          <CrashChangeLog data={data} />
        </Col>
      </Row>
    </div>
  );
}

export default withApollo(Crash);
