import React from "react";

import { Card, CardHeader, CardBody, Table, Badge } from "reactstrap";

const headers = ["Unit Number", "Body Style", "Year/Make/Model"];

const UnitDetailsCard = ({ unitData }) => {
  console.log(unitData);

  return (
    <Card>
      <CardHeader>Unit Details</CardHeader>
      <CardBody>
        <Table responsive striped>
          <thead>
            <tr>
              {headers.map(header => {
                return <th>{header}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {unitData.map(unit => {
              return (
                <tr key={`unit-${unit.unit_nbr}`}>
                  <td>{unit.unit_nbr}</td>
                  <td>{unit.body_style.veh_body_styl_desc}</td>
                  <td>{`${unit.veh_mod_year} ${unit.make.veh_make_desc} ${unit.model.veh_mod_desc}`}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </CardBody>
    </Card>
  );
};

export default UnitDetailsCard;
