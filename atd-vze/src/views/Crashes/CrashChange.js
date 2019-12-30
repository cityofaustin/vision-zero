import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { withApollo } from "react-apollo";
import { useQuery } from "@apollo/react-hooks";
import { MiniDiff } from "../../Components/MiniDiff";
import axios from "axios";

import "./crash.scss";

import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Button,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";

import { AppSwitch } from "@coreui/react";
import { GET_CRASH_CHANGE } from "../../queries/crashes_changes";
import { crashImportantDiffFields } from "./crashImportantDiffFields";
import { crashChangeQuotedFields } from "./crashChangeQuotedFields";

function CrashChange(props) {
  const crashId = props.match.params.id;
  const [selectedFields, setSelectedFields] = useState([]);
  const [recordData, setRecordData] = useState({});
  // Arrays of column names
  const [importantFieldList, setImportantFieldList] = useState([]);
  const [differentFieldsList, setDifferentFieldsList] = useState([]);
  const [selectableList, setSelectableList] = useState([]);
  // Arrays of Components
  const [importantFields, setImportantFields] = useState([]);
  const [differentFields, setDifferentFields] = useState([]);
  const [showFieldsDiffOnly, setShowFieldsDiffOnly] = useState(false);
  // Modals
  const [approveAllChanges, setApproveAllChanges] = useState(false);
  const [discardAllChanges, setDiscardAllChanges] = useState(false);
  const [clearAllSelections, setClearAllSelections] = useState(false);
  // CR3 Availbable
  const [cr3available, setCR3Available] = useState(false);
  const { error, data } = useQuery(GET_CRASH_CHANGE, {
    variables: { crashId },
  });

  /**
   * Returns true if fieldName exists within the selectedFields array.
   * @param fieldName {string} - The name of the field
   * @returns {boolean}
   */
  const isFieldEnabled = fieldName => {
    return selectedFields.includes(fieldName);
  };

  /**
   * Adds or removes field name from the selectedFields array.
   * @param fieldName {string} - The name of the field.
   */
  const toggleField = fieldName => {
    let newFieldList = selectedFields;

    // If it is there, remove it.
    if (isFieldEnabled(fieldName)) {
      const index = newFieldList.indexOf(fieldName);
      if (index !== -1) newFieldList.splice(index, 1);

      // If it isn't there, then add it.
    } else {
      newFieldList.push(fieldName);
    }
    const newList = [...newFieldList];
    console.log(newList);
    setSelectedFields(newList);
  };

  /**
   * Toggles the diff only option in state
   */
  const toggleDiffOnly = () => {
    setShowFieldsDiffOnly(!showFieldsDiffOnly);
  };

  /**
   * Returns an deconstructable array with two objects containing the old record and the new record.
   * @returns {object[]}
   */
  const getOriginalNewRecords = () => {
    const originalRecord = recordData["atd_txdot_crashes"][0] || null;
    const newRecord =
      JSON.parse(recordData["atd_txdot_changes"][0]["record_json"]) || null;

    return [originalRecord, newRecord];
  };

  /**
   * Toggles a modal based on a number.
   * @param mode {int} - The modal to toggle
   */
  const toggleModal = mode => {
    switch (mode) {
      case 1:
        setApproveAllChanges(!approveAllChanges);
        break;
      case 2:
        setDiscardAllChanges(!discardAllChanges);
        break;
      default:
        setClearAllSelections(!clearAllSelections);
        break;
    }
  };

  /**
   * Batch-enables a list of fields
   * @param mode {int} - The mode to operate: 1) Main, 2) All other fields, 3) All fields
   */
  const fieldsBatchEnable = mode => {
    let list = [];

    // Loop through main fields only
    if (mode === 1) {
      list = [...importantFieldList];
    }
    // Loop through all other fields
    else if (mode === 2) {
      list = [...differentFieldsList];
    }
    // Loop through all fields
    else if (mode === 3) {
      list = [...importantFieldList, ...differentFieldsList];
    }

    // If selectable & not already there
    const enabledList = list.filter(field => {
      return selectableList.includes(field) && !selectedFields.includes(field);
    });

    const newList = [...selectedFields, ...enabledList];
    setSelectedFields(newList);
  };

  /**
   * Batch-enables a list of fields
   * @param mode {int} - The mode to operate: 1) Main, 2) All other fields, 3) All fields
   */
  const fieldsBatchClear = mode => {
    let list = [];

    // Loop through main fields only
    if (mode === 1) {
      list = [...importantFieldList];
    }
    // Loop through all other fields
    else if (mode === 2) {
      list = [...differentFieldsList];
    }
    // Loop through all fields
    else if (mode === 3) {
      list = [...importantFieldList, ...differentFieldsList];
    }

    const enabledList = selectedFields.filter(field => {
      return !list.includes(field);
    });

    const newList = [...enabledList];
    setSelectedFields(newList);
  };

  /**
   * Downloads a CR3
   */
  const downloadCR3 = () => {
    const requestUrl = `${process.env.REACT_APP_CR3_API_DOMAIN}/cr3/download/${crashId}`;
    const token = window.localStorage.getItem("id_token");

    axios
      .request(requestUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(res => {
        const win = window.open(res.data.message, "_blank");
        win.focus();
      });
  };

  /**
   * Returns an array of strings with all the fields that have a different value.
   * @param data {object}
   * @returns {string[]}
   */
  const generate_diff = data => {
    const [originalRecord, newRecord] = getOriginalNewRecords();

    return Object.keys(newRecord)
      .map((currentKey, i) => {
        return `${newRecord[currentKey]}`.trim() !==
          `${originalRecord[currentKey]}`.trim()
          ? currentKey
          : "/-n/a-/";
      })
      .filter(e => e !== "/-n/a-/")
      .sort();
  };

  /**
   * Returns an array of strings containing the fields that are selectable
   * @returns {string[]}
   */
  const generate_diff_selectable = () => {
    const [originalRecord, newRecord] = getOriginalNewRecords();

    const selectable = Object.keys(newRecord).filter(field => {
      return (
        cleanString(originalRecord[field]) !== cleanString(newRecord[field])
      );
    });

    console.log(selectable);
    return selectable;
  };

  /**
   * Generates a mutation to update the original record.
   * @returns {string}
   */
  const generateMutationSave = () => {
    const newRecord =
      JSON.parse(recordData["atd_txdot_changes"][0]["record_json"]) || null;

    const mutationTemplate = `
      mutation processChange($crashId: Int) {
        update_atd_txdot_crashes(
            where: {
              crash_id: { _eq: $crashId }
            },
            
            _set: {
              %UPDATE_FIELDS%
            }
        ) {
          affected_rows
        },
        update_atd_txdot_changes(
            where: {
              record_id:    { _eq: $crashId }
              record_type:  { _eq: "crash" }
              status:       { _eq: 0 }
            },
            
            _set: {
              status: { _eq: 1 }
            }
        ) {
          affected_rows
        }
      }
    `;

    let updateFields = [];

    selectedFields.forEach(field => {
      // Generate the value
      let value = (crashChangeQuotedFields.includes(field)
        ? `"${newRecord[field]}"`
        : newRecord[field]
      ).trim();

      if (value && value !== '""' && value.length > 0) {
        // Generate the line
        const currentField = `${field}: ${value}`;

        // Append the field
        updateFields.push(currentField);
      }
    });

    return mutationTemplate.replace("%UPDATE_FIELDS%", updateFields.join("\n"));
  };

  /**
   * Generates a mutation to discard the current change
   * @returns {string}
   */
  const generateMutationDiscard = () => {
    return `
        mutation discardChange($crashId: Int) {
           update_atd_txdot_changes(
              where: {
                record_id:    { _eq: $crashId }
                record_type:  { _eq: "crash" }
                status:       { _eq: 0 }
              },
              
              _set: {
                status: { _eq: 2 }
              }
          ) {
            affected_rows
          }
        }
    `;
  };

  /**
   * Saves the selected fields and discards the change
   */
  const saveSelectedFields = () => {
    const mutation = generateMutationSave();
    console.log("saveSelectedFields() : Mutation Template");
    console.log(mutation);
    toggleModal(1);
  };

  /**
   * Discards the change
   */
  const discardChange = () => {
    const mutation = generateMutationDiscard();
    console.log("discardChange() : Mutation Template");
    console.log(mutation);
    toggleModal(3);
    alert("The user should now be taken to the index page.");
  };

  /**
   * Returns a clean string (if null, then assume empty.
   * @param input {string} - The string being cleaned
   * @returns {string}
   */
  const cleanString = input => {
    if (input === null) return "";
    return `${input}`.trim();
  };

  /**
   * Generates a JSX Row object, it returns null if there is no difference between the original value
   * and the new value from the new record as provided by the ETL process.
   * @param field {string} - The name of the field in the database (the column)
   * @param label {string} - The name of the label to show (if not the name of the field)
   * @param originalFieldValue {string} - The value of the record as it currently is in the database.
   * @param newFieldValue {string} - The value of the new record as provided by the ETL process.
   * @returns {Row}
   */
  const generateRow = (field, label, originalFieldValue, newFieldValue) => {
    const originalValue = cleanString(originalFieldValue);
    const newValue = cleanString(newFieldValue);

    const change = originalValue !== newValue;
    const selectorEnabled = isFieldEnabled(field);

    // if showFieldsDiffOnly is enabled, do not show if no change...
    if (showFieldsDiffOnly) {
      if (!change) return null;
    }

    return (
      <Row key={field} className={"crash-row"}>
        <Col xs="6" sm="6" md="1">
          {change && (
            <AppSwitch
              className={"mx-1"}
              variant={"pill"}
              color={"primary"}
              outline={"alt"}
              label
              dataOn={"\u2713"}
              dataOff={"\u2715"}
              onClick={() => toggleField(field)}
              checked={selectorEnabled}
            />
          )}
        </Col>
        <Col xs="6" sm="6" md="3">
          <strong>{field}</strong>
        </Col>
        <Col xs="12" sm="12" md="4">
          <Badge className="mr-1" color="light">
            Original
          </Badge>
          <span className="minidiff"> {originalValue}</span>
        </Col>
        <Col xs="12" sm="12" md="4">
          <Badge className="mr-1" color="danger">
            Change
          </Badge>
          <MiniDiff oldText={originalValue} newText={newValue} />
        </Col>
      </Row>
    );
  };

  // If the data object has no keys, then wait...
  if (data && Object.keys(data).length > 0) {
    if (Object.keys(recordData).length === 0) {
      setRecordData(data);
    }
  }

  /**
   * In this useEffect, we listen for any changes to the data or to the
   * selected fields. If they change, so does our two groups of fields.
   */
  useEffect(() => {
    if (Object.keys(recordData).length > 0) {
      if (recordData["setCR3Available"] || null === "Y") {
        setCR3Available(true);
      }

      // We need a list of all important fields as defined in crashImportantDiffFields
      setImportantFieldList(
        Object.keys(crashImportantDiffFields).filter(field => {
          return field;
        })
      );

      setSelectableList(generate_diff_selectable());
    }
  }, [recordData]);

  /**
   * In this useEffect, we listen for changes to the importantFieldList
   * group, as well as any changes to the showFieldsDiffOnly variable.
   */
  useEffect(() => {
    if (Object.keys(recordData).length === 0) return;

    const [originalRecord, newRecord] = getOriginalNewRecords();

    // Now we need the rest of all other fields
    setDifferentFieldsList(
      generate_diff(recordData).filter(field => {
        return !importantFieldList.includes(field);
      })
    );

    // Now we get to build our component based on our list of important fields
    setImportantFields(
      Object.keys(crashImportantDiffFields).map(field => {
        return generateRow(
          field,
          field.label,
          originalRecord[field],
          newRecord[field]
        );
      })
    );
  }, [importantFieldList, showFieldsDiffOnly, recordData, selectedFields]);

  /**
   * In this useEffect, we listen for changes to the differentFieldsList
   * group, as well as any changes to the showFieldsDiffOnly variable.
   */
  useEffect(() => {
    if (Object.keys(recordData).length === 0) return;

    const [originalRecord, newRecord] = getOriginalNewRecords();

    setDifferentFields(
      differentFieldsList.map(field => {
        return generateRow(
          field,
          field,
          originalRecord[field],
          newRecord[field]
        );
      })
    );
  }, [differentFieldsList, showFieldsDiffOnly, recordData, selectedFields]);

  return error ? (
    <div>{error}</div>
  ) : (
    <div className="animated fadeIn">
      <Row>
        <CardBody>
          <h1>Crash ID: {crashId}</h1>
        </CardBody>
      </Row>
      <Row>
        <Col xs="12" sm="12" md="12">
          <Card>
            <CardHeader>
              <span>
                <strong>Main Options</strong>
              </span>
              <div className="float-right minidiff--switchrow">
                <AppSwitch
                  className={"mx-1"}
                  color={"primary"}
                  checked={showFieldsDiffOnly ? "checked" : ""}
                  onClick={() => toggleDiffOnly()}
                />
                <span className="minidiff--switchlabel">
                  Show only fields with differences
                </span>
              </div>
            </CardHeader>
            <CardBody>
              <Row className="align-items-center">
                <Col sm xs="12" className="text-center">
                  <Link
                    className="btn btn-primary"
                    color="primary"
                    to={`/crashes/${crashId}`}
                    target="_blank"
                  >
                    <i className="fa fa-address-card-o"></i>&nbsp;Open Current
                    Record
                  </Link>
                </Col>
                <Col sm xs="12" className="text-center">
                  <Button
                    disabled={cr3available ? "" : "disabled"}
                    title={
                      cr3available
                        ? "Click to open in new window"
                        : "No CR3 Available"
                    }
                    color="secondary"
                    onClick={downloadCR3}
                  >
                    <i className="fa fa-file-pdf-o"></i>&nbsp;Download Current
                    CR3
                  </Button>
                </Col>
                <Col sm xs="12" className="text-center">
                  <Button color="warning" onClick={() => toggleModal(1)}>
                    <i className="fa fa-save"></i>&nbsp;Save Selected Changes
                  </Button>
                </Col>
                <Col
                  sm
                  xs="12"
                  className="text-center"
                  onClick={() => toggleModal(2)}
                >
                  <Button color="success">
                    <i className="fa fa-window-close"></i>&nbsp;Unselect all
                    changes
                  </Button>
                </Col>
                <Col
                  sm
                  xs="12"
                  className="text-center"
                  onClick={() => toggleModal(3)}
                >
                  <Button color="danger">
                    <i className="fa fa-trash"></i>&nbsp;Discard Incoming Record
                  </Button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* IMPORTANT FIELDS */}
      <Row>
        <Col xs="12" sm="12" md="12">
          <Card>
            <CardHeader>
              <span>
                <strong>Main fields</strong>
              </span>
              <Button
                color="ghost-dark"
                className="float-right"
                onClick={() => fieldsBatchEnable(1)}
              >
                <i className="fa fa-lightbulb-o"></i>&nbsp;Select All
              </Button>
              <Button
                color="ghost-dark"
                className="float-right"
                onClick={() => fieldsBatchClear(1)}
              >
                <i className="fa fa-lightbulb-o"></i>&nbsp;Clear All
              </Button>
            </CardHeader>
            <CardBody>{importantFields}</CardBody>
          </Card>
        </Col>
      </Row>

      {/* OTHER FIELDS */}
      <Row>
        <Col xs="12" sm="12" md="12">
          <Card>
            <CardHeader>
              <span>
                <strong>Other Fields</strong>
              </span>
              <Button
                color="ghost-dark"
                className="float-right"
                onClick={() => fieldsBatchEnable(2)}
              >
                <i className="fa fa-lightbulb-o"></i>&nbsp;Select All
              </Button>
              <Button
                color="ghost-dark"
                className="float-right"
                onClick={() => fieldsBatchClear(2)}
              >
                <i className="fa fa-lightbulb-o"></i>&nbsp;Clear All
              </Button>
            </CardHeader>
            <CardBody>{differentFields}</CardBody>
          </Card>
        </Col>
      </Row>

      <Modal
        isOpen={approveAllChanges}
        toggle={() => toggleModal(1)}
        className={"modal-warning"}
      >
        <ModalHeader toggle={() => toggleModal(1)}>
          {selectedFields.length > 0 && <>Save selected changes?</>}
          {selectedFields.length === 0 && <>No selected changes</>}
        </ModalHeader>
        <ModalBody>
          {selectedFields.length > 0 && (
            <>
              Click <strong>Save</strong> to save the selected changes into the
              record. Click <strong>Cancel</strong> to stop and close this
              dialog without changes.
            </>
          )}
          {selectedFields.length === 0 && (
            <>
              No changes have been selected. In order to make changes to the
              existing record, you must select at least one change.
            </>
          )}
        </ModalBody>
        <ModalFooter>
          {selectedFields.length > 0 && (
            <Button color="primary" onClick={() => saveSelectedFields()}>
              Save
            </Button>
          )}
          <Button color="secondary" onClick={() => toggleModal(1)}>
            {selectedFields.length > 0 ? "Cancel" : "Close"}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={discardAllChanges}
        toggle={() => toggleModal(2)}
        className={"modal-success"}
      >
        <ModalHeader toggle={() => toggleModal(2)}>Unselect all?</ModalHeader>
        <ModalBody>
          Click <strong>Unselect All</strong> to turn off every selected item.
          Click <strong>Cancel</strong> to stop and close this dialog without
          changes.
        </ModalBody>
        <ModalFooter>
          <Button
            color="success"
            onClick={() => {
              fieldsBatchClear(3);
              toggleModal(2);
            }}
          >
            Unselect All
          </Button>{" "}
          <Button color="secondary" onClick={() => toggleModal(2)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={clearAllSelections}
        toggle={() => toggleModal(3)}
        className={"modal-danger"}
      >
        <ModalHeader toggle={() => toggleModal(3)}>
          Discard incoming record?
        </ModalHeader>
        <ModalBody>
          Click <strong>Discard</strong> to discard the new incoming record, and
          leave the original the way it is without changes. Click{" "}
          <strong>Cancel</strong> to stop and close this dialog without changes.{" "}
          <strong>This cannot be undone.</strong>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={() => discardChange()}>
            I am sure, Discard
          </Button>{" "}
          <Button color="secondary" onClick={() => toggleModal(3)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default withApollo(CrashChange);
