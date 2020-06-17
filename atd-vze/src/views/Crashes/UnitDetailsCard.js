import React, { useState, useEffect } from "react";
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

const EditFieldForm = ({
  field,
  value,
  unit,
  handleCancelClick,
  selectOptions,
  handleSubmit,
  handleInputChange,
}) => {
  let prefix = unitDataMap[0].fields[field].lookupPrefix;

  let defaultValue = selectOptions.find(opt => opt[`${prefix}_desc`] === value)[
    `${prefix}_id`
  ];

  return (
    <form onSubmit={e => handleSubmit(e)}>
      <Input
        name={field}
        id={field}
        onChange={e => handleInputChange(e, unit)}
        defaultValue={defaultValue}
        type="select"
      >
        {selectOptions.map(option => (
          <option value={option[`${prefix}_id`]} key={option[`${prefix}_id`]}>
            {option[`${prefix}_desc`]}
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
  );
};

const UnitDetailsCard = ({ isExpanded, toggleAccordion, ...props }) => {
  const crashId = props.match.params.id;

  const [editField, setEditField] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [formData, setFormData] = useState({});
  const [unitData, setUnitData] = useState(null);

  const { loading, error, data, refetch } = useQuery(GET_UNITS, {
    variables: { crashId },
  });
  const { data: lookupSelectOptions } = useQuery(GET_UNIT_LOOKUPS);

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  const handleEditClick = (field, unit) => {
    setEditField(field);
    setEditUnit(unit);
  };

  const handleCancelClick = e => {
    e.preventDefault();

    // RESET state on cancel
    setEditField("");
    setEditUnit("");
    setFormData({});
  };

  const handleSubmit = e => {
    e.preventDefault();

    props.client
      .mutate({
        mutation: UPDATE_UNIT,
        variables: {
          crashId: crashId,
          unitId: editUnit,
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
    setEditUnit("");
    setFormData({});
  };

  const handleInputChange = e => {
    const fieldKey = unitDataMap[0].fields[editField].edit_field_name;
    const newFormState = Object.assign(formData, {
      [fieldKey]: e.target.value,
      updated_by: localStorage.getItem("hasura_user_email"),
    });
    setFormData(newFormState);
  };

  const formatValue = (data, field) => {
    let fieldValue = data[field];

    if (typeof data[field] === "object") {
      fieldValue =
        data[field] && data[field][unitDataMap[0].fields[field].lookup_desc];
    }

    return fieldValue ? fieldValue : "";
  };

  return loading ? (
    <span>Loading...</span>
  ) : (
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
                  <th key={`th_${unitDataMap[0].fields[field].label}`}>
                    {unitDataMap[0].fields[field].label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && !data ? (
                <tr>Loading...</tr>
              ) : (
                data.atd_txdot_units
                  .sort((a, b) => (a.unit_nbr > b.unit_nbr ? 1 : -1)) // SORT UNITS by "unit_nbr"
                  .map(unit => {
                    return (
                      <tr key={`unit_${unit.unit_nbr}`}>
                        {Object.keys(unitDataMap[0].fields).map((field, i) => {
                          const isEditing =
                            field === editField && unit.unit_nbr === editUnit;

                          return (
                            <td key={`unit_td_${i}`}>
                              {isEditing ? (
                                <EditFieldForm
                                  field={field}
                                  unit={unit.unit_nbr}
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
                                      <Button
                                        block
                                        color="secondary"
                                        size="sm"
                                        className="btn-pill mt-2"
                                        style={{ width: "50px" }}
                                        onClick={e =>
                                          handleEditClick(field, unit.unit_nbr)
                                        }
                                      >
                                        <i className="fa fa-pencil edit-toggle" />
                                      </Button>
                                    )}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
              )}
            </tbody>
          </Table>
        </CardBody>
      </Collapse>
    </Card>
  );
};

export default UnitDetailsCard;
