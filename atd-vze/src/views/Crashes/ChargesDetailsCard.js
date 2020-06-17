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

const ChargesDetailsCard = ({ chargesData, isExpanded, toggleAccordion }) => {
  return (
    <Card className="mb-0">
      <CardHeader id="headingThree">
        <Button
          block
          color="link"
          className="text-left m-0 p-0"
          onClick={() => toggleAccordion(2)}
          aria-expanded={isExpanded}
          aria-controls="collapseThree"
        >
          <h5 className="m-0 p-0">
            <i className="fa fa-legal" /> Charges
            <Badge color="secondary float-right">
              {
                chargesData.filter(charge => charge.charge !== "NO CHARGES")
                  .length
              }
            </Badge>
          </h5>
        </Button>
      </CardHeader>
      <Collapse isOpen={isExpanded} data-parent="#accordion" id="collapseThree">
        <CardBody>
          <Table responsive>
            <thead>
              <tr>
                <th>Charge</th>
                <th>Charge Category</th>
              </tr>
            </thead>
            <tbody>
              {chargesData.map(
                (charge, i) =>
                  charge.charge !== "NO CHARGES" && (
                    <tr key={`charges-${i}`}>
                      <td>{charge.charge}</td>
                      <td>{charge.charge_cat_id}</td>
                    </tr>
                  )
              )}
            </tbody>
          </Table>
        </CardBody>
      </Collapse>
    </Card>
  );
};

export default ChargesDetailsCard;
