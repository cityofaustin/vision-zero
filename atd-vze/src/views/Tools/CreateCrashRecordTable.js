import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { withApollo } from "react-apollo";
import { gql } from "apollo-boost";
import { useQuery } from "@apollo/react-hooks";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  FormGroup,
  Input,
  Label,
  Table,
} from "reactstrap";

const GET_TEMP_RECORDS = gql`
  query getTempRecords {
    atd_txdot_crashes(where: { temp_record: { _eq: true } }) {
      crash_id
      case_id
      crash_date
      crash_time
      updated_by
      last_update
    }
  }
`;

const DELETE_TEMP_RECORD = gql`
  mutation deleteTempRecords($crashId: Int!) {
    delete_atd_txdot_crashes(where: { crash_id: { _eq: $crashId } }) {
      affected_rows
    }
    delete_atd_txdot_units(where: { crash_id: { _eq: $crashId } }) {
      affected_rows
    }
    delete_atd_txdot_primaryperson(where: { crash_id: { _eq: $crashId } }) {
      affected_rows
    }
    delete_atd_txdot_person(where: { crash_id: { _eq: $crashId } }) {
      affected_rows
    }
  }
`;

const CreateCrashRecordTable = ({ client }) => {
  const [crashesData, setCrashesData] = useState(null);
  const [crashSearch, setCrashSearch] = useState("");
  const { loading, error, data } = useQuery(GET_TEMP_RECORDS);

  useEffect(() => {
    setCrashesData(data);
  }, [data]);

  useEffect(() => {
    console.log("Crashes Data change detected");
  }, [crashesData]);

  useEffect(() => {
    console.log(crashSearch);
  }, [crashSearch]);

  const onKeyboardTypeHandler = e => {
    setCrashSearch(e.target.value);
  };

  return (
    <>
      {error && <>Could not load data</>}
      {loading && <>Loading data, please wait...</>}
      {crashesData && (
        <Card>
          <CardHeader>
            <i className="fa fa-align-justify"></i> Temporary Crashes in
            Database
          </CardHeader>
          <CardBody>
            <FormGroup>
              <Label htmlFor="company">
                Type to search by case id (exact match)
              </Label>
              <Input
                type="text"
                id="case_id_search"
                placeholder="Enter Case ID"
                onChange={onKeyboardTypeHandler}
              />
            </FormGroup>
            <Table responsive striped>
              <thead>
                <tr>
                  <th>Crash ID</th>
                  <th>Case ID</th>
                  <th>Crash Date</th>
                  <th>Crash Time</th>
                  <th>Updated By</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {crashesData &&
                  crashesData["atd_txdot_crashes"] &&
                  crashesData.atd_txdot_crashes.map((item, index) => {
                    if (crashSearch !== "" && item.case_id !== crashSearch)
                      return null;

                    return (
                      <tr key={index}>
                        <td>
                          <Link to={`/crashes/${item.crash_id}`}>
                            {item.crash_id}
                          </Link>
                        </td>
                        <td>{item.case_id}</td>
                        <td>{item.crash_date}</td>
                        <td>{item.crash_time}</td>
                        <td>{item.last_update}</td>
                        <td>
                          <Button
                            color="danger"
                            className="btn-pill"
                            size={"sm"}
                          >
                            <i className="fa fa-remove"></i>&nbsp;Delete
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      )}
    </>
  );
};

export default withApollo(CreateCrashRecordTable);
