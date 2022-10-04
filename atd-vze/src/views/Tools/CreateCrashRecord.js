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

  const unitsInitialState = [
    { unit_desc_id: 1, atd_fatality_count: 0, sus_serious_injry_cnt: 0 },
  ];

  const formInitialState = {
    tempId: 1000,
    caseId: "",
    crashTime: format(new Date(), "HH:mm:ss"),
    crashDate: format(new Date(), "yyyy-MM-dd"),
    primaryAddress: "",
    secondayAddress: "",
    units: [
      { unit_desc_id: 1, atd_fatality_count: 0, sus_serious_injry_cnt: 0 },
    ],
  };

  const [tempId, setTempId] = useState(formInitialState.tempId);
  const [caseId, setCaseId] = useState(formInitialState.caseId);
  const [successfulNewRecordId, setSuccessfulNewRecordId] = useState(null);
  const [crashTime, setCrashTime] = useState(formInitialState.crashTime);
  const [crashDate, setCrashDate] = useState(formInitialState.crashDate);
  const [feedback, setFeedback] = useState(false);
  const [primaryAddress, setPrimaryAddress] = useState(
    formInitialState.primaryAddress
  );
  const [secondayAddress, setSecondaryAddress] = useState(
    formInitialState.secondayAddress
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
  }, [client]);

  const resetForm = () => {
    setCaseId(formInitialState.caseId);
    setCrashTime(formInitialState.crashTime);
    setCrashDate(formInitialState.crashDate);
    setPrimaryAddress(formInitialState.primaryAddress);
    setSecondaryAddress(formInitialState.secondayAddress);
    unitFormDispatch({ type: "reset" });
  };

  const handleFormSubmit = e => {
    e.preventDefault();
    setFeedback(false);

    client
      .query({
        query: gql`
          {
            atd_txdot_crashes(where: {case_id: {_eq: "${caseId}"}}) {
              case_id
            }
          }
        `,
      })
      .then(res => {
        if (res.data.atd_txdot_crashes.length > 0) {
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
          let personObjects = "[";
          let unitObjects = "[";

          unitFormState.forEach((unit, i) => {
            let unitNumber = i + 1;

            unitObjects = unitObjects.concat(
              `{
          crash_id: $crash_id,
          unit_nbr: ${unitNumber},
          death_cnt: ${Number(unit.atd_fatality_count)},
          sus_serious_injry_cnt: ${Number(unit.sus_serious_injry_cnt)},
          unit_desc_id: ${Number(unit.unit_desc_id)}
        }`
            );

            for (
              let index = 0;
              index < Number(unit.atd_fatality_count);
              index++
            ) {
              personObjects = personObjects.concat(`{
        crash_id: ${tempId},
        unit_nbr: ${unitNumber},
        prsn_injry_sev_id: 4,
      }`);
            }

            for (
              let index = 0;
              index < Number(unit.sus_serious_injry_cnt);
              index++
            ) {
              personObjects = personObjects.concat(`{
        crash_id: ${tempId},
        unit_nbr: ${unitNumber},
        prsn_injry_sev_id: 1,
      }`);
            }
          });

          personObjects = personObjects.concat("]");
          unitObjects = unitObjects.concat("]");

          const INSERT_BULK = gql`
      mutation bulkInsert(
        $address_confirmed_primary: String
        $address_confirmed_secondary: String
        $atd_fatality_count: Int
        $case_id: String
        $crash_date: date
        $crash_fatal_fl: String
        $crash_id: Int
        $crash_time: time,
        $sus_serious_injry_cnt: Int,
        $updated_by: String
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
              updated_by: $updated_by 
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
          objects: ${unitObjects}
        ) {
          affected_rows
        }

        insert_atd_txdot_primaryperson(objects: ${personObjects}) {
          affected_rows
        }
      }
    `;
          const fatalityCountSum = unitFormState.reduce(
            (a, b) => a + Number(b.atd_fatality_count),
            0
          );
          const susSeriousInjuryCountSum = unitFormState.reduce(
            (a, b) => a + Number(b.sus_serious_injry_cnt),
            0
          );

          const crashVariables = {
            atd_fatality_count: fatalityCountSum,
            address_confirmed_primary: primaryAddress,
            address_confirmed_secondary: secondayAddress,
            case_id: caseId,
            crash_date: crashDate,
            crash_fatal_fl: fatalityCountSum > 0 ? "Y" : "N",
            crash_id: tempId,
            crash_time: crashTime,
            sus_serious_injry_cnt: susSeriousInjuryCountSum,
            updated_by: user.email,
          };

          client
            .mutate({
              mutation: INSERT_BULK,
              variables: crashVariables,
            })
            .then(res => {
              // Increment the temp ID so the user can resuse the form.
              setTempId(tempId + 1);
              setSuccessfulNewRecordId(
                res.data.insert_atd_txdot_crashes.returning[0].crash_id
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
              <Label htmlFor="date-input">Crash Time</Label>
            </Col>
            <Col xs="12" md="9">
              <Input
                type="time"
                id="time-input"
                name="time-input"
                placeholder="time"
                value={crashTime}
                invalid={isFieldInvalid(crashTime)}
                onChange={e => setCrashTime(e.target.value)}
              />
              {isFieldInvalid(crashTime) ? (
                <FormFeedback>Crash Time can't be blank.</FormFeedback>
              ) : (
                <FormText className="help-block">
                  Please enter the Crash Time
                </FormText>
              )}
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
                invalid={isFieldInvalid(crashDate)}
                onChange={e => setCrashDate(e.target.value)}
              />
              {isFieldInvalid(crashDate) ? (
                <FormFeedback>Crash Date can't be blank.</FormFeedback>
              ) : (
                <FormText className="help-block">
                  Please enter the Crash Date.
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
