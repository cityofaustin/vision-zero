import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { withApollo } from "react-apollo";
import { gql } from "apollo-boost";
import { useQuery, useMutation } from "@apollo/react-hooks";

import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormGroup,
  Input,
  Label, Modal, ModalBody, ModalFooter, ModalHeader,
  Table
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

const CreateCrashRecordTable = () => {

  const [crashesData, setCrashesData] = useState(null);
  const [crashSearch, setCrashSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const { loading, error, data } = useQuery(GET_TEMP_RECORDS, {fetchPolicy: 'no-cache'});
  const [deleteRecord] = useMutation(DELETE_TEMP_RECORD);

  useEffect(() => {
    setCrashesData(data);
  }, [data]);

  /**
   * Updates the case_id being searched
   * @param {Object} e - The Event being handled
   */
  const onKeyboardTypeHandler = e => {
    setCrashSearch(e.target.value);
  };

  /**
   * Deletes all the temporary records in the database
   */
  const handleDelete = () => {
    setFeedback(null);
    deleteRecord({ variables: { crashId: deleteId } }).then(() => {
      const newData = crashesData["atd_txdot_crashes"].filter((item) => {
        return item.crash_id !== deleteId;
      });
      setDeleteId(null);
      setFeedback(`Crash ID ${deleteId} has been deleted.`);
      setCrashesData({"atd_txdot_crashes": newData});
      toggleModalDelete();
    }).catch(err => {
      setFeedback(String(err));
      setDeleteId(null);
    });
  }

  /**
   * Opens/Closes the delete modal
   */
  const toggleModalDelete = () => {
    setModalOpen(!modalOpen);
  }

  /**
   * Commits the crash_id to be deleted to state, and prompts for deletion.
   * @param {int} crashId - The crash id to be deleted.
   */
  const openModalDelete = (crashId) => {
    setDeleteId(crashId);
    toggleModalDelete();
  }

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
            <Alert
              color="secondary"
              isOpen={!!feedback}
              toggle={() => setFeedback(null)}
            >
              {feedback}
            </Alert>
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
                  <th>Last Update</th>
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
                        <td>{item.updated_by}</td>
                        <td>{item.last_update}</td>
                        <td>
                          <Button
                            color="danger"
                            className="btn-pill"
                            size={"sm"}
                            onClick={() => openModalDelete(item.crash_id)}
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
      <Modal
        isOpen={modalOpen}
        className={"modal-danger"}
        toggle={toggleModalDelete}
      >
        <ModalHeader toggle={toggleModalDelete}>
          Delete this record?
        </ModalHeader>
        <ModalBody>Are you sure you want to delete crash id <strong>{deleteId}</strong>? This cannot be undone.</ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={handleDelete}>
            Ok
          </Button>
          <Button color="secondary" onClick={toggleModalDelete}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default withApollo(CreateCrashRecordTable);
