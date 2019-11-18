import React from "react";
import { Card, CardHeader, CardBody, Button, Alert } from "reactstrap";
import axios from "axios";

function CR3Record(props) {
  const requestCR3 = () => {
    const requestUrl = `${process.env.REACT_APP_CR3_API_DOMAIN}/cr3/download/${props.crashId}`;
    const token = window.localStorage.getItem("id_token");

    axios
      .request(requestUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(res => {
        const win = window.open(res.data.message, "_blank");
        win.focus();
      });
  };

  return (
    <Card>
      <CardHeader>Crash Report</CardHeader>
      <CardBody>
        {props.isCr3Stored ? (
          <Button color="primary" onClick={requestCR3}>
            Download CR-3 PDF
          </Button>
        ) : (
          <Alert color="warning">
            The CR-3 file for this crash has not been imported. Use Brazos to
            search for the associated CR-3 Crash Report.
          </Alert>
        )}
      </CardBody>
    </Card>
  );
}

export default CR3Record;
