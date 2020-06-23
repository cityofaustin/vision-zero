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

const PeopleDetailsCard = ({
  primaryPersonData,
  personData,
  isExpanded,
  toggleAccordion,
}) => {
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
              {primaryPersonData.concat(personData).length}
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
                <th>City</th>
                <th>ZIP</th>
                <th>Age</th>
                <th>Injury Severity</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {primaryPersonData.map((person, i) => (
                <tr key={`person-${i}`}>
                  <td>{person.unit_nbr}</td>
                  <td>{person.drvr_city_name}</td>
                  <td>{person.drvr_zip}</td>
                  <td>{person.prsn_age}</td>
                  <td>
                    <Badge
                      color={getInjurySeverityColor(
                        person.injury_severity.injry_sev_desc
                      )}
                    >
                      {person.injury_severity.injry_sev_desc}
                    </Badge>
                  </td>
                  <td>{person.person_type.prsn_type_desc}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          {personData.length > 0 && (
            <>
              <h5>Other People</h5>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Unit</th>
                    <th>Age</th>
                    <th>Injury Severity</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {personData.map(person => (
                    <tr>
                      <td>{person.unit_nbr}</td>
                      <td>{person.prsn_age}</td>
                      <td>
                        <Badge
                          color={getInjurySeverityColor(
                            person.injury_severity.injry_sev_desc
                          )}
                        >
                          {person.injury_severity.injry_sev_desc}
                        </Badge>
                      </td>
                      <td>{person.person_type.prsn_type_desc}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </CardBody>
      </Collapse>
    </Card>
  );
};

export default PeopleDetailsCard;
