import React from "react";
import { Card, CardHeader, CardBody } from "reactstrap";

function CrashNarrative({ investigatorNarrative }) {
  return (
    <Card>
      <CardHeader>Crash Narrative</CardHeader>
      <CardBody>
        {investigatorNarrative}
      </CardBody>
    </Card>
  );
}

export default CrashNarrative;
