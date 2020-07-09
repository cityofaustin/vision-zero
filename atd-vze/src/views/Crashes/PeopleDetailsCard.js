import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import { useAuth0, isReadOnly } from "../../auth/authContext";

// TODO: program triggers for injury_sev -> cnts
// TODO: Hide edit controls for People & Units for Read Only Users

import {
  Card,
  CardHeader,
  CardBody,
  Table,
  Badge,
  Button,
  Collapse,
  Input,
} from "reactstrap";

import RelatedRecordsTable from "./RelatedRecordsTable";

import { primaryPersonDataMap, personDataMap } from "./personDataMap";
import { GET_PERSON_LOOKUPS } from "../../queries/lookups";
import {
  GET_PEOPLE,
  UPDATE_PRIMARYPERSON,
  UPDATE_PERSON,
} from "../../queries/people";

const getInjurySeverityColor = desc => {
  switch (desc) {
    case "UNKNOWN":
      return "muted";
    case "NOT INJURED":
      return "primary";
    case "INCAPACITATING INJURY":
      return "warning";
    case "NON-INCAPACITATING INJURY":
      return "warning";
    case "POSSIBLE INJURY":
      return "warning";
    case "KILLED":
      return "danger";
    default:
      break;
  }
};

const PeopleDetailsCard = ({ isExpanded, toggleAccordion, ...props }) => {
  const { getRoles } = useAuth0();
  const roles = getRoles();

  const crashId = props.match.params.id;

  const [editField, setEditField] = useState("");
  const [editPerson, setEditPerson] = useState("");
  const [formData, setFormData] = useState({});

  const { data: lookupSelectOptions } = useQuery(GET_PERSON_LOOKUPS);
  const { loading, error, data, refetch } = useQuery(GET_PEOPLE, {
    variables: { crashId },
  });

  const handleSubmit = e => {
    e.preventDefault();

    props.client
      .mutate({
        mutation: UPDATE_PRIMARYPERSON,
        variables: {
          crashId: crashId,
          personId: editPerson,
          changes: { ...formData },
        },
      })
      .then(res => {
        if (!res.errors) {
          refetch();
        } else {
          console.log(res.errors);
        }
      });

    // RESET state after submit
    setEditField("");
    setEditPerson("");
    setFormData({});
  };

  const handleInputChange = e => {
    const manualFieldKey = "prsn_injry_sev_id";

    const newFormState = Object.assign(formData, {
      [manualFieldKey]: e.target.value,
      updated_by: localStorage.getItem("hasura_user_email"),
    });
    setFormData(newFormState);
  };

  const handleEditClick = (field, person) => {
    setEditField(field);
    setEditPerson(person);
  };

  const handleCancelClick = e => {
    e.preventDefault();

    // RESET state on cancel
    setEditField("");
    setEditPerson("");
    setFormData({});
  };

  const personMutation = {
    mutation: UPDATE_PERSON,
    variables: {
      crashId: crashId,
      personId: "",
      changes: {},
    },
  };

  return (
    <Card className="mb-0">
      <CardHeader id="headingOne">
        <Button
          block
          color="link"
          className="text-left m-0 p-0"
          onClick={() => toggleAccordion(1)}
          aria-expanded={isExpanded}
          aria-controls="collapseOne"
        >
          <h5 className="m-0 p-0">
            <i className="fa fa-group" /> People{" "}
            <Badge color="secondary float-right">
              {
                data.atd_txdot_primaryperson.concat(data.atd_txdot_person)
                  .length
              }
            </Badge>
          </h5>
        </Button>
      </CardHeader>
      <Collapse
        isOpen={isExpanded}
        data-parent="#accordion"
        id="collapseOne"
        aria-labelledby="headingOne"
      >
        <CardBody>
          <h5>Drivers/Primary People</h5>

          <Table responsive>
            <thead>
              <tr>
                <th>Unit</th>
                <th>Injury Severity</th>
                <th>Type</th>
                <th>Age</th>
                <th>City</th>
                <th>ZIP</th>
              </tr>
            </thead>
            <tbody>
              {data.atd_txdot_primaryperson
                .sort((a, b) => (a.unit_nbr > b.unit_nbr ? 1 : -1))
                .map((person, i) => {
                  const isEditing =
                    editField === "injry_sev_desc" &&
                    person.primaryperson_id === editPerson;

                  const injurySeverityLookup =
                    lookupSelectOptions.atd_txdot__injry_sev_lkp;

                  return (
                    <tr key={`person-${i}`}>
                      <td>{person.unit_nbr}</td>
                      <td>
                        {isEditing ? (
                          <form onSubmit={e => handleSubmit(e)}>
                            <Input
                              name={"injry_sev_desc"}
                              id={"injry_sev_desc"}
                              onChange={e => handleInputChange(e)}
                              defaultValue={person.injury_severity.injry_sev_id}
                              type="select"
                            >
                              {injurySeverityLookup.map(option => (
                                <option
                                  value={option["injry_sev_id"]}
                                  key={option["injry_sev_id"]}
                                >
                                  {option["injry_sev_desc"]}
                                </option>
                              ))}
                            </Input>
                            <Button
                              type="submit"
                              block
                              color="primary"
                              size="sm"
                              className="btn-pill mt-2"
                            >
                              <i className="fa fa-check edit-toggle" />
                            </Button>
                            <Button
                              type="cancel"
                              block
                              color="danger"
                              size="sm"
                              className="btn-pill mt-2"
                              onClick={e => handleCancelClick(e)}
                            >
                              <i className="fa fa-times edit-toggle"></i>
                            </Button>
                          </form>
                        ) : (
                          <>
                            <Badge
                              color={getInjurySeverityColor(
                                person.injury_severity.injry_sev_desc
                              )}
                            >
                              {person.injury_severity.injry_sev_desc}
                            </Badge>
                            {/* {fieldConfig.editable &&
                                  !isReadOnly(roles) &&
                                  !isEditing && ( */}
                            {
                              <Button
                                block
                                color="secondary"
                                size="sm"
                                className="btn-pill mt-2"
                                style={{ width: "50px" }}
                                onClick={e =>
                                  handleEditClick(
                                    "injry_sev_desc",
                                    person.primaryperson_id
                                  )
                                }
                              >
                                <i className="fa fa-pencil edit-toggle" />
                              </Button>
                            }
                          </>
                        )}
                      </td>
                      <td>{person.person_type.prsn_type_desc}</td>
                      <td>{person.prsn_age}</td>
                      <td>{person.drvr_city_name}</td>
                      <td>{person.drvr_zip}</td>
                    </tr>
                  );
                })}
            </tbody>
          </Table>

          {data.atd_txdot_person.length > 0 && (
            <>
              <RelatedRecordsTable
                fieldConfig={personDataMap[0]}
                data={data.atd_txdot_person}
                sortField={"unit_nbr"}
                tableName={"atd_txdot_person"}
                keyField={"person_id"}
                lookupOptions={lookupSelectOptions.atd_txdot__injry_sev_lkp}
                mutation={personMutation}
                refetch={refetch}
                {...props}
              />
            </>
          )}
        </CardBody>
      </Collapse>
    </Card>
  );
};

export default PeopleDetailsCard;
