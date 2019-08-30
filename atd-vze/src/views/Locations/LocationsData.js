import React from "react";
import { Table } from "reactstrap";
import { Link } from "react-router-dom";

const columns = ["#", "Location ID", "Description"];
function LocationsData(props) {
  return (
    <Table responsive>
      <thead>
        <tr>
          {columns.map((col, i) => (
            <th key={`th-${i}`}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {props.data.atd_txdot_locations.map((location, i) => (
          <tr key={location.unique_id}>
            <td>{props.offset + i + 1}</td>
            <td>
              <Link to={`/locations/${location.unique_id}`}>
                {location.unique_id}
              </Link>
            </td>
            <td>{location.description}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default LocationsData;
