import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Alert,
  Button,
} from "reactstrap";
import { withApollo } from "react-apollo";
import { useQuery } from "@apollo/react-hooks";
import {
  useAuth0,
  isAdmin,
  isItSupervisor,
  isReadOnly,
} from "../../auth/authContext";

import CrashMap from "./Maps/CrashMap";
import CrashEditCoordsMap from "./Maps/CrashEditCoordsMap";
import Widget02 from "../Widgets/Widget02";
import CrashChangeLog from "./CrashChangeLog";
import CrashDiagram from "./CrashDiagram";
import CrashNarrative from "./CrashNarrative";
import DataTable from "../../Components/DataTable";
import Notes from "../../Components/Notes/Notes";
import { createCrashDataMap } from "./crashDataMap";
import Recommendations from "./Recommendations/Recommendations";
import Page404 from "../Pages/Page404/Page404";
import UnitDetailsCard from "./UnitDetailsCard";
import PeopleDetailsCard from "./PeopleDetailsCard";
import ChargesDetailsCard from "./ChargesDetailsCard";

import "./crash.scss";

import { UPDATE_CRASH, GET_CRASH } from "../../queries/crashes";
import {
  INSERT_NOTE,
  UPDATE_NOTE,
  SOFT_DELETE_NOTE,
} from "../../queries/crashNotes";

function Crash(props) {
  const crashId = props.match.params.id.toUpperCase();
  const {
    loading: crashLoading,
    error: crashError,
    data: crashData,
    refetch: crashRefetch,
  } = useQuery(GET_CRASH, {
    variables: { crashId },
  });

  const [editField, setEditField] = useState("");
  const [formData, setFormData] = useState({});
  const [isEditingCoords, setIsEditingCoords] = useState(false);

  const { getRoles } = useAuth0();
  const roles = getRoles();

  if (crashLoading) return "Loading...";
  if (crashError) return `Error! ${crashError.message}`;

  const handleInputChange = editValue => {
    const newFormState = Object.assign(formData, {
      [editField]: editValue ? editValue.toString().toUpperCase() : null,
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
          id: crashPk,
          changes: { ...formData, ...secondaryFormData },
        },
      })
      .then(res => crashRefetch())
      .then(res => {
        setEditField("");
        setFormData({});
      });
  };

  const crashRecord = {
    // Need to construct empty objects if crash doesnt exist
    crash: crashData?.crashes?.[0] || {
      crash_injury_metrics_view: {},
      crashes_list_view: {},
    },
  };

  const crashPk = crashRecord?.crash?.id;

  const {
    crash_injury_metrics_view: { vz_fatality_count: deathCount },
    crash_injury_metrics_view: { sus_serious_injry_count: seriousInjuryCount },
    crashes_list_view: { is_manual_geocode: isManualGeocode },
    address_primary: primaryAddress,
    address_secondary: secondaryAddress,
    crash_injury_metrics_view: { years_of_life_lost: yearsOfLifeLost },
    investigator_narrative: investigatorNarrative,
    cr3_stored_fl: cr3StoredFlag,
    latitude,
    longitude,
    location_id: locationId,
    is_temp_record: tempRecord,
    private_dr_fl: isPrivateDrive,
    in_austin_full_purpose: isInAustinFullPurpose,
  } = crashRecord?.crash;

  const isCrashFatal = deathCount > 0 ? true : false;
  const shouldShowFatalityRecommendations =
    (isAdmin(roles) || isItSupervisor(roles)) && isCrashFatal;

  const hasLocation = crashRecord?.crash["location_id"];
  const hasCoordinates = !!latitude && !!longitude;

  return !crashData.crashes[0] ? (
    <Page404 />
  ) : (
    <div className="animated fadeIn">
      <Row>
        <Col>
          <h2 className="h2 mb-3">{`${primaryAddress ? primaryAddress : ""} ${
            secondaryAddress ? "& " + secondaryAddress : ""
          }`}</h2>
        </Col>
      </Row>
      {(isPrivateDrive !== false || isInAustinFullPurpose !== true) && (
        <Row>
          <Col>
            <Alert color="warning">
              <i className="fa fa-exclamation-triangle" /> This crash is not
              included in Vision Zero statistical reporting because{" "}
              {isPrivateDrive
                ? "it occurred on a private drive"
                : "it is located outside of the Austin full purpose jurisdiction"}
            </Alert>
          </Col>
        </Row>
      )}
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
            mainText="Suspected Serious Injuries"
            icon="fa fa-medkit"
            color="warning"
          />
        </Col>
        <Col xs="12" sm="6" md="4">
          <Widget02
            header={`${yearsOfLifeLost || 0}`}
            mainText="Years of Life Lost"
            icon="fa fa-hourglass-end"
            color="info"
          />
        </Col>
      </Row>
      <Row>
        <Col xs="12" md="6" className="mb-4">
          <Card className="h-100">
            <CardHeader>
              <Row>
                <Col>
                  Crash Location (ID:{" "}
                  {(hasLocation && (
                    <Link to={`/locations/${locationId}`}>{locationId}</Link>
                  )) ||
                    "unassigned"}
                  )
                  <br />
                  Geocode Provider:{" "}
                  {hasCoordinates
                    ? isManualGeocode
                      ? "Manual Q/A"
                      : "TxDOT CRIS"
                    : "No Primary Coordinates"}
                </Col>
                <Col>
                  {!isEditingCoords && !isReadOnly(roles) && (
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
            </CardHeader>
            <CardBody
              className="d-flex flex-column"
              style={{ minHeight: "400px" }}
            >
              {!hasCoordinates && (
                <Alert color="danger">
                  Crash record is missing latitude and longitude values required
                  for map display
                </Alert>
              )}
              {!isEditingCoords ? (
                <CrashMap latitude={latitude} longitude={longitude} />
              ) : (
                <CrashEditCoordsMap
                  latitude={latitude}
                  longitude={longitude}
                  crashPk={crashPk}
                  refetchCrashData={crashRefetch}
                  setIsEditingCoords={setIsEditingCoords}
                />
              )}
            </CardBody>
          </Card>
        </Col>
        <Col xs="12" md="6" className="mb-4">
          <CrashDiagram
            crashId={crashId}
            isCr3Stored={cr3StoredFlag}
            isTempRecord={tempRecord}
          />
        </Col>
      </Row>
      {!!investigatorNarrative ? (
        <Row>
          <Col>
            <CrashNarrative investigatorNarrative={investigatorNarrative} />
          </Col>
        </Row>
      ) : (
        <div></div>
      )}
      <Row>
        <Col>
          <UnitDetailsCard
            data={crashRecord?.crash?.units}
            refetch={crashRefetch}
            {...props}
          />
          <PeopleDetailsCard
            data={crashRecord?.crash?.people_list_view}
            refetch={crashRefetch}
            {...props}
          />
          <ChargesDetailsCard data={crashRecord?.crash?.charges_cris} />
        </Col>
      </Row>
      {shouldShowFatalityRecommendations && (
        <Row>
          <Col>
            <Recommendations
              crashPk={crashPk}
              recommendation={crashRecord?.crash?.recommendation}
              refetch={crashRefetch}
            />
          </Col>
        </Row>
      )}
      <Row>
        <Col>
          <Notes
            parentRecordId={crashPk}
            notes={crashRecord?.crash?.crash_notes}
            INSERT_NOTE={INSERT_NOTE}
            UPDATE_NOTE={UPDATE_NOTE}
            SOFT_DELETE_NOTE={SOFT_DELETE_NOTE}
            refetch={crashRefetch}
          />
        </Col>
      </Row>
      <Row>
        <DataTable
          dataMap={createCrashDataMap(tempRecord)}
          dataTable="crash"
          formData={formData}
          setEditField={setEditField}
          editField={editField}
          handleInputChange={handleInputChange}
          handleFieldUpdate={handleFieldUpdate}
          data={crashRecord}
          crashRefetch={crashRefetch}
        />
        <Col md="12">
          <CrashChangeLog data={crashRecord?.crash?.change_logs} />
        </Col>
      </Row>
    </div>
  );
}

export default withApollo(Crash);
