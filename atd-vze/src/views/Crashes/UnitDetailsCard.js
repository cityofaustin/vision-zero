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

const EditFieldForm = ({ field, value, handleCancelClick, selectOptions }) => {
  console.log(selectOptions);
  console.log(field);
  console.log(value);
  let prefix = unitDataMap[0].fields[field].lookupPrefix;

  let defaultValue = selectOptions.find(opt => opt[`${prefix}_desc`] === value)[
    `${prefix}_id`
  ];

  console.log(defaultValue);
  return (
    <form onSubmit={e => console.log(e)}>
      <Input
        name={field}
        id={field}
        // onChange={e => handleInputChange(e)}
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

const UnitDetailsCard = ({ unitsData, isExpanded, toggleAccordion }) => {
  const [editField, setEditField] = useState("");
  const [editUnit, setEditUnit] = useState("");

  const { data: lookupSelectOptions } = useQuery(GET_UNIT_LOOKUPS);

  console.log(lookupSelectOptions);
  // TODO SORT UNITS BY UNIT_NBR
  console.log(unitsData);

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

  return (
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
            <Badge color="secondary float-right">{unitsData.length}</Badge>
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
              {unitsData.map(unit => {
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
                              handleCancelClick={e => handleCancelClick(e)}
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
  );
};

export default UnitDetailsCard;
