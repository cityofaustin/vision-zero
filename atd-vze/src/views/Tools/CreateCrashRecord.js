import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Col,
  Input,
  Label,
  Form,
  FormGroup,
  FormText,
} from "reactstrap";
import moment from "moment";
import { withApollo } from "react-apollo";
import { gql } from "apollo-boost";
import "./CreateCrashRecord.css";
import UnitsForm from "./UnitsForm";

const CreateCrashRecord = ({ client }) => {
  const [tempId, setTempId] = useState(1000);
  const [caseId, setCaseId] = useState("");
  const [fatalityCount, setFatalityCount] = useState(0);
  const [susSeriousInjuryCount, setSusSeriousInjuryCount] = useState(0);
  const [successfulNewRecordId, setSuccessfulNewRecordId] = useState(null);
  const [crashTime, setCrashTime] = useState(
    moment(new Date()).format("HH:mm:ss")
  );
  const [crashDate, setCrashDate] = useState(
    moment(new Date()).format("YYYY-MM-DD")
  );
  const [feedback, setFeedback] = useState(false);
  const [primaryAddress, setPrimaryAddress] = useState("");
  const [secondayAddress, setSecondaryAddress] = useState("");
  const [numberOfUnits, setNumberOfUnits] = useState(1);
  const [unitFormData, setUnitFormData] = useState([
    { unit_desc_id: 1, atd_fatality_count: 0, sus_serious_injry_cnt: 0 },
  ]);

  console.log("formData", unitFormData);

  useEffect(() => {
    const GET_HIGHEST_TEMP_RECORD_ID = gql`
      {
        atd_txdot_crashes(
          where: { temp_record: { _eq: true } }
          limit: 1
          order_by: { crash_id: desc }
        ) {
          crash_id
        }
      }
    `;

    client
      .mutate({
        mutation: GET_HIGHEST_TEMP_RECORD_ID,
      })
      .then(res => {
        // Find the highest existing temp crash record ID value.
        // If there aren't and temp crash records,
        // default to 1000.
        const highestCurrentTempId = res.data.atd_txdot_crashes[0]
          ? res.data.atd_txdot_crashes[0].crash_id
          : 1000;
        setTempId(highestCurrentTempId + 1);
      })
      .catch(error => {
        setFeedback({ title: "Error", message: String(error) });
      });
  });

  const resetForm = () => {
    setCaseId("");
    setFatalityCount("");
    setSusSeriousInjuryCount("");
  };

  const handleFormSubmit = e => {
    e.preventDefault();

    // Build an array of persons objects formated as a string
    // so the String can be interpolated into the gql tag syntax.
    let personObjects = "[";

    for (let index = 0; index < susSeriousInjuryCount; index++) {
      personObjects = personObjects.concat(`{
        crash_id: ${tempId},
        unit_nbr: 1,
        prsn_injry_sev_id: 1,
      }`);
    }
    for (let index = 0; index < fatalityCount; index++) {
      personObjects = personObjects.concat(`{
        crash_id: ${tempId},
        unit_nbr: 1,
        prsn_injry_sev_id: 4,
      }`);
    }

    personObjects = personObjects.concat("]");

    const INSERT_BULK = gql`
      mutation bulkInsert(
        $address_confirmed_primary: String
        $address_confirmed_secondary: String
        $atd_fatality_count: Int
        $case_id: String
        $crash_date: date
        $crash_fatal_fl: String
        $crash_id: Int
        $crash_time: time
        $sus_serious_injry_cnt: Int
      ) {
        insert_atd_txdot_crashes(
          objects: [
            {
              address_confirmed_primary: $address_confirmed_primary
              address_confirmed_secondary: $address_confirmed_secondary
              atd_fatality_count: $atd_fatality_count
              case_id: $case_id
              city_id: 22  
              crash_date: $crash_date
              crash_fatal_fl: $crash_fatal_fl
              crash_id: $crash_id
              crash_time: $crash_time
              sus_serious_injry_cnt: $sus_serious_injry_cnt
              temp_record: true
            }
          ]
        ) {
          affected_rows
          returning {
            crash_id
          }
        }

        insert_atd_txdot_units(
          objects: [{ crash_id: $crash_id, unit_nbr: 1 }]
        ) {
          affected_rows
        }

        insert_atd_txdot_primaryperson(objects: ${personObjects}) {
          affected_rows
        }
      }
    `;

    const crashVariables = {
      atd_fatality_count: fatalityCount,
      address_confirmed_primary: primaryAddress,
      address_confirmed_secondary: secondayAddress,
      case_id: caseId,
      crash_date: crashDate,
      crash_fatal_fl: fatalityCount > 0 ? "Y" : "N",
      crash_id: tempId,
      crash_time: crashTime,
      sus_serious_injry_cnt: susSeriousInjuryCount,
    };

    client
      .mutate({
        mutation: INSERT_BULK,
        variables: crashVariables,
      })
      .then(res => {
        console.log(res);

        // Increment the temp ID so the user can resuse the form.
        setTempId(tempId + 1);
        setSuccessfulNewRecordId(
          res.data.insert_atd_txdot_crashes.returning[0].crash_id
        );
        resetForm();
      })
      .catch(error => {
        setFeedback({ title: "Error", message: String(error) });
      });
  };

  return (
    <Form
      onSubmit={e => handleFormSubmit(e)}
      onReset={e => resetForm(e)}
      className="form-horizontal"
    >
      <Card>
        <CardHeader>Create New Crash Record Set</CardHeader>
        <CardBody>
          <Alert
            color="success"
            isOpen={!!successfulNewRecordId}
            toggle={e => setSuccessfulNewRecordId(false)}
          >
            {/*eslint-disable-next-line*/}
            Crash record creation successful.{" "}
            <Link
              to={`/crashes/${successfulNewRecordId}`}
              className="alert-link"
            >
              Open new Crash ID #{successfulNewRecordId} details page
            </Link>
            .
          </Alert>
          <Alert
            color="danger"
            isOpen={!!feedback}
            toggle={e => setFeedback(false)}
          >
            {feedback.title}: {feedback.message}
          </Alert>

          <FormGroup row>
            <Col md="3">
              <Label htmlFor="hf-email">Case ID</Label>
            </Col>
            <Col xs="12" md="9">
              <Input
                type="number"
                id="hf-case-id"
                name="hf-case-id"
                placeholder="Enter Case ID..."
                value={caseId}
                onChange={e => setCaseId(e.target.value)}
              />
              <FormText className="help-block">
                Please enter the Case ID
              </FormText>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Col md="3">
              <Label htmlFor="date-input">Crash Time</Label>
            </Col>
            <Col xs="12" md="9">
              <Input
                type="time"
                id="time-input"
                name="time-input"
                placeholder="time"
                value={crashTime}
                onChange={e => setCrashTime(e.target.value)}
              />
              <FormText className="help-block">
                Please enter the Crash Time
              </FormText>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Col md="3">
              <Label htmlFor="date-input">Crash Date</Label>
            </Col>
            <Col xs="12" md="9">
              <Input
                type="date"
                id="date-input"
                name="date-input"
                placeholder="date"
                value={crashDate}
                onChange={e => setCrashDate(e.target.value)}
              />
              <FormText className="help-block">
                Please enter the Crash Date
              </FormText>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Col md="3">
              <Label htmlFor="date-input">Primary Address</Label>
            </Col>
            <Col xs="12" md="9">
              <Input
                type="text"
                id="primary-address-input"
                name="primary-address-input"
                placeholder="ex: S 900 AUSTIN AVE"
                value={primaryAddress}
                onChange={e => setPrimaryAddress(e.target.value)}
              />
              <FormText className="help-block">
                Please enter the Primary Address
              </FormText>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Col md="3">
              <Label htmlFor="date-input">Secondary Address</Label>
            </Col>
            <Col xs="12" md="9">
              <Input
                type="text"
                id="secondary-address-input"
                name="secondary-address-input"
                placeholder="ex: N MOPAC BLVD"
                value={secondayAddress}
                onChange={e => setSecondaryAddress(e.target.value)}
              />
              <FormText className="help-block">
                Please enter the Secondary Address
              </FormText>
            </Col>
          </FormGroup>

          <UnitsForm units={unitFormData} handleUpdate={setUnitFormData} />

          <div className="d-flex flex-row-reverse">
            <Button
              color="primary"
              size="lg"
              onClick={e => {
                setUnitFormData(unitFormData.concat({ hi: "foo" }));
              }}
            >
              <i className="fa fa-plus"></i>&nbsp;Add Unit
            </Button>
          </div>
        </CardBody>
        <CardFooter>
          <Button type="submit" size="sm" color="primary" className="mr-2">
            <i className="fa fa-dot-circle-o"></i> Submit
          </Button>
          <Button type="reset" size="sm" color="danger">
            <i className="fa fa-ban"></i> Reset
          </Button>
        </CardFooter>
      </Card>
    </Form>
  );
};

export default withApollo(CreateCrashRecord);
