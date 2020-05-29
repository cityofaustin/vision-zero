import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Table,
  Alert,
  Button,
} from "reactstrap";

import { withApollo } from "react-apollo";
import { useQuery, useMutation } from "@apollo/react-hooks";

import CSVReader from "react-csv-reader";

function ToolsUploadNonCR3(props) {
  const [records, setRecords] = useState([]);

  const csvParserOptions = {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: header => header.toLowerCase().replace(/\W/g, "_"),
  };

  const handleOnFileLoaded = (data, fileInfo) => {
    console.log("File loaded");
    console.dir(data, fileInfo);
    setRecords(data);
  };

  const handleOnError = err => {
    console.log("File loading error: ", err);
  };

  return (
    <div>
      <span>
        {records.length === 0 ? (
          <>Select a CSV file with Non-CR3 records</>
        ) : (
          <>
            There are <b>{records.length}</b> records to be inserted
          </>
        )}
      </span>
      <CSVReader
        cssClass="csv-reader-input"
        label=""
        onFileLoaded={handleOnFileLoaded}
        onError={handleOnError}
        parserOptions={csvParserOptions}
        inputId="ObiWan"
        inputStyle={{ color: "red" }}
      />

      <div>
        {records.length > 0 ? <span>{JSON.stringify(records)}</span> : <></>}
      </div>

    </div>
  );
}

export default withApollo(ToolsUploadNonCR3);
