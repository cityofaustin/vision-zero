import React from "react";

import {
  Card,
  CardHeader,
  CardBody,
  Table,
  Badge,
  Button,
  Collapse,
} from "reactstrap";

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

const headers = [
  "Unit",
  "Type",
  "Body Style",
  "Year/Make/Model",
  "Direction",
  "Movement",
  "Factor 1",
];

const UnitDetailsCard = ({ unitsData, isExpanded, toggleAccordion }) => {
  console.log(unitsData);

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
                {headers.map(header => (
                  <th>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {unitsData.map((unit, i) => {
                const {
                  unit_nbr,
                  unit_description,
                  body_style,
                  contributing_factor_1,
                  veh_mod_year,
                  make,
                  model,
                  travel_direction_desc,
                  movement,
                } = unit;
                return (
                  <tr key={`person-${i}`}>
                    <td>{unit_nbr && unit_nbr}</td>
                    <td>
                      {getUnitType(
                        unit_description && unit_description.veh_unit_desc_desc
                      )}{" "}
                      {unit_description && unit_description.veh_unit_desc_desc}
                    </td>
                    <td>{body_style && body_style.veh_body_styl_desc}</td>
                    <td>
                      {veh_mod_year && veh_mod_year}{" "}
                      {make && make.veh_make_desc} {model && model.veh_mod_desc}
                    </td>
                    <td>
                      {travel_direction_desc &&
                        travel_direction_desc.trvl_dir_desc}
                    </td>
                    <td>{movement && movement.movement_desc}</td>
                    <td>
                      {contributing_factor_1 &&
                        contributing_factor_1.contrib_factr_desc}
                    </td>
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
