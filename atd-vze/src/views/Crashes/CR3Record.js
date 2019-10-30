import React, { Component, useState } from "react";
import { Card, CardHeader, CardBody, Button } from "reactstrap";
import axios from "axios";

function CR3Record(props) {
  const requestCR3 = () => {
    console.log(props);
    let requestUrl =
      "https://atd-vz-api-staging.austinmobility.io/cr3/download/11156151";
    let token = window.localStorage.getItem("id_token");

    axios
      .request(requestUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(res => {
        console.log("res", res);
        var win = window.open(res, "_blank");
        console.log(" should open a new window");
        win.focus();
      });
  };

  return (
    <Card>
      <CardHeader>Crash Report</CardHeader>
      <CardBody>
        <Button color="primary" onClick={requestCR3}>
          Download CR-3 PDF
        </Button>
      </CardBody>
    </Card>
  );
}

export default CR3Record;
