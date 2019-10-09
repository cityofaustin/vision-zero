import React, { useState, useEffect } from "react";
import { withApollo } from "react-apollo";
import { CSVLink } from "react-csv";

const GridExportData = ({ exportData, query }) => {
  return (
    <>
      <CSVLink
        className=""
        data={exportData[query.table]}
        filename={query.table + Date.now()}
      >
        <i className="fa fa-save fa-2x ml-2 mt-1" />
      </CSVLink>
    </>
  );
};

export default withApollo(GridExportData);
