import React, { useState, useEffect, useReducer } from "react";
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
  FormFeedback,
} from "reactstrap";
import { format } from "date-fns";
import { withApollo } from "react-apollo";
import { gql } from "apollo-boost";
import "./CreateCrashRecord.css";
import UnitsForm from "./UnitsForm";
import CreateCrashRecordTable from "./CreateCrashRecordTable";
import { useAuth0 } from "../../auth/authContext";

const CreateCrashRecord = ({ client }) => {
  const { user } = useAuth0();

  const userEmail = user.email;

  const unitsInitialState = [
    { unit_desc_id: 1, fatality_count: 0, sus_serious_injry_cnt: 0 },
  ];

  const formInitialState = {
    caseId: "",
    crashTimestamp: format(new Date(), "yyyy-MM-dd"),
    primaryStreetName: "",
    secondaryStreetName: "",
    units: [{ unit_desc_id: 1, fatality_count: 0, sus_serious_injry_cnt: 0 }],
  };

  const [caseId, setCaseId] = useState(formInitialState.caseId);
  const [successfulNewRecordId, setSuccessfulNewRecordId] = useState(null);
  const [crashTimestamp, setCrashTimestamp] = useState(
    formInitialState.crashTimestamp
  );
  const [feedback, setFeedback] = useState(false);
  const [primaryStreetName, setPrimaryStreetName] = useState(
    formInitialState.primaryStreetName
  );
  const [secondaryStreetName, setSecondaryStreetName] = useState(
    formInitialState.secondaryStreetname
  );

  function unitsReducer(state, action) {
    const { type, payload, unitIndex } = action;

    // When a user clicks the "Add Unit" button, add another unit object to the
    // unit state array using the initial state template provided from the payload.
    if (type === "addNewUnit") {
      return [...state, payload];
    }

    if (type === "reset") {
      return unitsInitialState;
    }

    const updatedState = [...state];
    updatedState[unitIndex][type] = payload;
    return updatedState;
  }

  const [unitFormState, unitFormDispatch] = useReducer(
    unitsReducer,
    unitsInitialState
  );

  function isFieldInvalid(data) {
    return !data;
  }

  const resetForm = () => {
    setCaseId(formInitialState.caseId);
    setCrashTimestamp(formInitialState.crashTimestamp);
    setPrimaryStreetName(formInitialState.primaryStreetName);
    setSecondaryStreetName(formInitialState.secondaryStreetName);
    unitFormDispatch({ type: "reset" });
  };

  const handleFormSubmit = e => {
    e.preventDefault();
    setFeedback(false);

    client
      .query({
        query: gql`
          {
            crashes(where: {case_id: {_eq: "${caseId}"}}) {
              case_id
            }
          }
        `,
      })
      .then(res => {
        if (res.data.crashes.length > 0) {
          setFeedback({ title: "Error", message: "Case ID must be unique." });
        } else {
          if (isFieldInvalid(caseId)) {
            setFeedback({
              title: "Error",
              message: "Must have a valid Case ID.",
            });
            return false;
          }

          // Build an array of persons objects formated as a string
          // so the String can be interpolated into the gql tag syntax.
          let unitObjects = "";

          unitFormState.forEach((unit, i) => {
            let unitNumber = i + 1;

            let personObjects = "";

            for (let index = 0; index < Number(unit.fatality_count); index++) {
              personObjects = personObjects.concat(`{
        unit_nbr: ${unitNumber},
        prsn_injry_sev_id: 4,
        cris_schema_version: "2023",
        updated_by: "${userEmail}",
        created_by: "${userEmail}"
      }`);
            }

            for (
              let index = 0;
              index < Number(unit.sus_serious_injry_cnt);
              index++
            ) {
              personObjects = personObjects.concat(`{
        unit_nbr: ${unitNumber},
        prsn_injry_sev_id: 1,
        updated_by: "${userEmail}",
        created_by: "${userEmail}"
      }`);
            }

            unitObjects = unitObjects.concat(`{
              unit_nbr: ${unitNumber},
            unit_desc_id: ${Number(unit.unit_desc_id)},
            cris_schema_version: "2023",
            updated_by: "${userEmail}",
            created_by: "${userEmail}",
            people_cris: {
              data: [
                ${personObjects}
              ]
            }
          }`);
          });

          const INSERT_BULK = gql`
            mutation bulkInsert(
              $rpt_street_name: String
              $rpt_sec_street_name: String
              $case_id: String
              $crash_timestamp: timestamptz
              $updated_by: String
              $created_by: String
            ) {
              insert_crashes_cris(
                objects: [
                  {
                    rpt_street_name: $rpt_street_name
                    rpt_sec_street_name: $rpt_sec_street_name
                    case_id: $case_id
                    rpt_city_id: 22
                    crash_timestamp: $crash_timestamp
                    updated_by: $updated_by
                    created_by: $created_by
                    cris_schema_version: "2023"
                    is_temp_record: true
                    units_cris: { data: [${unitObjects}] }
                  }
                ]
              ) {
                returning {
                  id
                }
              }
            }
          `;
          const fatalityCountSum = unitFormState.reduce(
            (a, b) => a + Number(b.fatality_count),
            0
          );
          const susSeriousInjuryCountSum = unitFormState.reduce(
            (a, b) => a + Number(b.sus_serious_injry_cnt),
            0
          );

          const crashVariables = {
            rpt_street_name: primaryStreetName,
            rpt_sec_street_name: secondaryStreetName,
            case_id: caseId,
            crash_timestamp: crashTimestamp,
            updated_by: userEmail,
            created_by: userEmail,
          };

          client
            .mutate({
              mutation: INSERT_BULK,
              variables: crashVariables,
            })
            .then(res => {
              setSuccessfulNewRecordId(
                res.data.insert_crashes_cris.returning[0].id
              );
              resetForm();
              // unitFormDispatch({ type: "reset" });
            })
            .catch(error => {
              setFeedback({ title: "Error", message: String(error) });
            });
        }
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
              {isFieldInvalid(caseId) ? (
                <FormFeedback>
                  Case ID must be unique and can't be blank.
                </FormFeedback>
              ) : (
                <FormText className="help-block">
                  Please enter the Case ID
                </FormText>
              )}
            </Col>
          </FormGroup>
          <FormGroup row>
            <Col md="3">
              <Label htmlFor="date-input">Crash Timestamp</Label>
            </Col>
            <Col xs="12" md="9">
              <Input
                type="datetime-local"
                id="timestamp-input"
                name="timestamp-input"
                placeholder="timestamp"
                value={crashTimestamp}
                invalid={isFieldInvalid(crashTimestamp)}
                onChange={e => setCrashTimestamp(e.target.value)}
              />
              {isFieldInvalid(crashTimestamp) ? (
                <FormFeedback>Crash Timestamp can't be blank.</FormFeedback>
              ) : (
                <FormText className="help-block">
                  Please enter the Crash Timestamp
                </FormText>
              )}
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
                value={primaryStreetName}
                onChange={e => setPrimaryStreetName(e.target.value)}
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
                value={secondaryStreetName}
                onChange={e => setSecondaryStreetName(e.target.value)}
              />
              <FormText className="help-block">
                Please enter the Secondary Address
              </FormText>
            </Col>
          </FormGroup>

          <UnitsForm
            units={unitFormState}
            handleUnitFormChange={unitFormDispatch}
            client={client}
          />

          <div className="d-flex flex-row-reverse">
            <Button
              color="primary"
              size="sm"
              onClick={e => {
                unitFormDispatch({
                  type: "addNewUnit",
                  payload: unitsInitialState[0],
                });
              }}
            >
              <i className="fa fa-plus"></i>&nbsp;Add Unit
            </Button>
          </div>
        </CardBody>
        <CardFooter>
          <div className="d-flex flex-row-reverse">
            <Button type="submit" size="lg" color="primary">
              <i className="fa fa-dot-circle-o"></i> Submit
            </Button>
            <Button type="reset" size="lg" color="danger" className="mr-3">
              <i className="fa fa-ban"></i> Reset
            </Button>
          </div>
        </CardFooter>
      </Card>
      <CreateCrashRecordTable />
    </Form>
  );
};

export default withApollo(CreateCrashRecord);
