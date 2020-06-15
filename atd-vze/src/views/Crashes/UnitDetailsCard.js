import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks";

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

import { unitDataMap } from "./unitDataMap";
import { GET_UNIT_LOOKUPS } from "../../queries/lookups";
import { GET_UNITS, UPDATE_UNIT } from "../../queries/units";

const getUnitType = type => {
  switch (type) {
    case "MOTOR VEHICLE":
      return <i className="fa fa-car" />;
    case "TRAIN":
      return <i className="fa fa-train" />;
    case "PEDALCYCLIST":
      return <i className="fa fa-bicycle" />;
    case "PEDESTRIAN":
      return <i className="fa fa-child" />;
    case "MOTORIZED CONVEYANCE":
      return "MOTORIZED CONVEYANCE";
    case "TOWED/PUSHED/TRAILER":
      return "TOWED/PUSHED/TRAILER";
    case "NON-CONTACT":
      return "NON-CONTACT";
    case "OTHER (EXPLAIN IN NARRATIVE)":
      return "Other";
    default:
      break;
  }
};

const EditFieldForm = ({
  field,
  value,
  handleCancelClick,
  selectOptions,
  handleSubmit,
  handleInputChange,
}) => {
  console.log(selectOptions);
  console.log(field);
  console.log(value);
  let prefix = unitDataMap[0].fields[field].lookupPrefix;

  let defaultValue = selectOptions.find(opt => opt[`${prefix}_desc`] === value)[
    `${prefix}_id`
  ];

  console.log(defaultValue);

  return (
    <form onSubmit={e => handleSubmit(e)}>
      <Input
        name={field}
        id={field}
        onChange={e => handleInputChange(e)}
        defaultValue={defaultValue}
        type="select"
      >
        {selectOptions.map(option => (
          <option value={option[`${prefix}_id`]}>
            {option[`${prefix}_desc`]}
          </option>
        ))}
      </Input>
      <button type="submit">
        <i className="fa fa-check edit-toggle" />
      </button>
      <button type="cancel">
        <i
          className="fa fa-times edit-toggle"
          onClick={e => handleCancelClick(e)}
        ></i>
      </button>
    </form>
  );
};

const UnitDetailsCard = ({ isExpanded, toggleAccordion, ...props }) => {
  console.log(props.client);

  // TODO: GET THE REAL ID
  const crashId = "17678998";

  const [editField, setEditField] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [formData, setFormData] = useState({});

  const { loading, error, data, refetch } = useQuery(GET_UNITS, {
    variables: { crashId },
  });

  const { data: lookupSelectOptions } = useQuery(GET_UNIT_LOOKUPS);

  console.log(lookupSelectOptions);
  // TODO SORT UNITS BY UNIT_NBR
  console.log(data);

  console.log(unitDataMap[0].fields);

  const handleEditClick = (field, unit) => {
    setEditField(field);
    setEditUnit(unit);
  };

  const handleCancelClick = e => {
    e.preventDefault();

    setEditField("");
    setEditUnit("");
  };

  const handleSubmit = e => {
    debugger;
    e.preventDefault();

    debugger;
    console.log("hi");

    // Expose secondary field to update and add to mutation payload below
    // let secondaryFormData = {};
    // if (fields[field] && fields[field].secondaryFieldUpdate) {
    //   secondaryFormData = fields[field].secondaryFieldUpdate;
    // }

    props.client
      .mutate({
        mutation: UPDATE_UNIT,
        variables: {
          crashId: "17678998",
          changes: { ...formData },
          // crashId: crashId,
          // changes: { ...formData, ...secondaryFormData },
        },
      })
      .then(res => refetch());

    setEditField("");
  };

  const handleInputChange = e => {
    const newFormState = Object.assign(formData, {
      [editField]: e.target.value,
      updated_by: localStorage.getItem("hasura_user_email"),
    });
    console.log(newFormState);
    setFormData(newFormState);
  };

  return (
    !!data && (
      <Card className="mb-0">
        <CardHeader id="headingTwo">
          <Button
            block
            color="link"
            className="text-left m-0 p-0"
            onClick={() => toggleAccordion(0)}
            aria-expanded={isExpanded}
            aria-controls="collapseOne"
          >
            <h5 className="m-0 p-0">
              <i className="fa fa-car" /> Units
              <Badge color="secondary float-right">{data.length}</Badge>
            </h5>
          </Button>
        </CardHeader>
        <Collapse isOpen={isExpanded} data-parent="#accordion" id="collapseOne">
          <CardBody>
            <Table responsive>
              <thead>
                <tr>
                  {Object.keys(unitDataMap[0].fields).map(field => (
                    <th>{unitDataMap[0].fields[field].label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.atd_txdot_units.map(unit => {
                  const formatValue = (data, field) => {
                    let fieldValue = data[field];

                    if (typeof data[field] === "object") {
                      fieldValue =
                        data[field] &&
                        data[field][unitDataMap[0].fields[field].lookup_desc];
                    }

                    return fieldValue ? fieldValue : "";
                  };

                  return (
                    <tr key={`unit_${unit.unit_nbr}`}>
                      {Object.keys(unitDataMap[0].fields).map((field, i) => {
                        const isEditing =
                          field === editField && unit.unit_nbr == editUnit;

                        return (
                          <td>
                            {isEditing ? (
                              <EditFieldForm
                                field={field}
                                value={formatValue(unit, field)}
                                handleCancelClick={handleCancelClick}
                                handleInputChange={handleInputChange}
                                handleSubmit={handleSubmit}
                                selectOptions={
                                  lookupSelectOptions[
                                    unitDataMap[0].fields[field].lookupOptions
                                  ]
                                }
                              />
                            ) : (
                              <div>
                                <span className="mr-2">
                                  {formatValue(unit, field)}
                                </span>

                                {unitDataMap[0].fields[field].editable &&
                                  !isEditing && (
                                    <i
                                      className="fa fa-pencil edit-toggle"
                                      onClick={e =>
                                        handleEditClick(field, unit.unit_nbr)
                                      }
                                    />
                                  )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </CardBody>
        </Collapse>
      </Card>
    )
  );
};

export default UnitDetailsCard;
