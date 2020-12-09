import React from "react";
import { Card, CardHeader, CardBody } from "reactstrap";

function CrashNarrative({ narrativeText }) {
  return (
    <Card>
      <CardHeader>Crash Narrative</CardHeader>
      <CardBody>
        {!!narrativeText ? narrativeText : "Crash narrative unavailable."}
      </CardBody>
    </Card>
  );
}

export default CrashNarrative;
