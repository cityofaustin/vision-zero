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

const CreateCrashRecord = ({ client }) => {
  const [tempId, setTempId] = useState(1000);
  const [caseId, setCaseId] = useState("");
  const [fatalityCount, setFatalityCount] = useState(0);
  const [susSeriousInjuryCount, setSusSeriousInjuryCount] = useState(0);
  const [successfulNewRecordId, setSuccessfulNewRecordId] = useState(null);
  const [crashDate, setCrashDate] = useState(
    moment(new Date()).format("YYYY-MM-DD")
  );
  const [feedback, setFeedback] = useState(false);

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
        $crash_id: Int
        $case_id: String
        $crash_fatal_fl: String
        $atd_fatality_count: Int
        $sus_serious_injry_cnt: Int
        $crash_date: date
      ) {
        insert_atd_txdot_crashes(
          objects: [
            {
              crash_id: $crash_id
              case_id: $case_id
              crash_fatal_fl: $crash_fatal_fl
              atd_fatality_count: $atd_fatality_count
              sus_serious_injry_cnt: $sus_serious_injry_cnt
              temp_record: true
              crash_date: $crash_date
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
      crash_id: tempId,
      case_id: caseId,
      crash_fatal_fl: fatalityCount > 0 ? "Y" : "N",
      atd_fatality_count: fatalityCount,
      sus_serious_injry_cnt: susSeriousInjuryCount,
      crash_date: crashDate,
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
    <Card>
      <Form
        onSubmit={e => handleFormSubmit(e)}
        onReset={e => resetForm(e)}
        className="form-horizontal"
      >
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
              <Label htmlFor="hf-fatality-count">Fatality Count</Label>
            </Col>
            <Col xs="12" md="9">
              <Input
                type="number"
                id="hf-fatality-count"
                name="hf-fatality-count"
                placeholder="Enter Fatality Count..."
                value={fatalityCount}
                onChange={e => setFatalityCount(e.target.value)}
              />
              <FormText className="help-block">
                Please enter the Fatality Count
              </FormText>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Col md="3">
              <Label htmlFor="hf-fatality-count">
                Suspected Serious Injury Count
              </Label>
            </Col>
            <Col xs="12" md="9">
              <Input
                type="number"
                id="hf-fatality-count"
                name="hf-fatality-count"
                placeholder="Enter Suspected Serious Injury Count..."
                value={susSeriousInjuryCount}
                onChange={e => setSusSeriousInjuryCount(e.target.value)}
              />
              <FormText className="help-block">
                Please enter the Suspected Serious Injury Count
              </FormText>
            </Col>
          </FormGroup>
        </CardBody>
        <CardFooter>
          <Button type="submit" size="sm" color="primary" className="mr-2">
            <i className="fa fa-dot-circle-o"></i> Submit
          </Button>
          <Button type="reset" size="sm" color="danger">
            <i className="fa fa-ban"></i> Reset
          </Button>
        </CardFooter>
      </Form>
    </Card>
  );
};

export default withApollo(CreateCrashRecord);
