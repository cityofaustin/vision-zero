import React from "react";
import { Card, CardHeader, CardBody } from "reactstrap";

function CrashNarrative({ investigatorNarrative }) {
  return (
    <Card>
      <CardHeader>Crash Narrative</CardHeader>
      <CardBody>
        {!!investigatorNarrative ? investigatorNarrative : "Crash narrative unavailable."}
      </CardBody>
    </Card>
  );
}

export default CrashNarrative;
