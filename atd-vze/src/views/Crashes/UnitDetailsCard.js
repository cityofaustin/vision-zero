import React from "react";
import { useQuery } from "@apollo/react-hooks";

import {
  Card,
  CardHeader,
  CardBody,
  Badge,
  Button,
  Collapse,
} from "reactstrap";

import RelatedRecordsTable from "./RelatedRecordsTable";

import { unitDataMap } from "./unitDataMap";
import { GET_UNIT_LOOKUPS } from "../../queries/lookups";
import { GET_UNITS, UPDATE_UNIT } from "../../queries/units";

// // Quickfix to prioritize the main cardinal directions.
// if (fieldConfig.format === "select") {
//   selectOptions.sort((a, b) => (a[`${prefix}_desc`].length > 5 ? 1 : -1));

//   defaultValue = selectOptions.find(opt => opt[`${prefix}_desc`] === value)[
//     `${prefix}_id`
//   ];
// }

const UnitDetailsCard = ({ isExpanded, toggleAccordion, ...props }) => {
  const crashId = props.match.params.id;

  const unitMutation = {
    mutation: UPDATE_UNIT,
    variables: {
      crashId: crashId,
      unitId: "",
      changes: {},
    },
  };

  const { loading, error, data, refetch } = useQuery(GET_UNITS, {
    variables: { crashId },
  });
  const { data: lookupSelectOptions } = useQuery(GET_UNIT_LOOKUPS);

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  return loading ? (
    <span>Loading...</span>
  ) : (
    <Card className="mb-0">
      <CardHeader id="headingTwo">
        <Button
          block
          color="link"
          className="text-left m-0 p-0"
          onClick={() => toggleAccordion(0)}
          aria-expanded={isExpanded}
          aria-controls="collapseOne"
        >
          <h5 className="m-0 p-0">
            <i className="fa fa-car" /> Units
            <Badge color="secondary float-right">
              {data.atd_txdot_units.length}
            </Badge>
          </h5>
        </Button>
      </CardHeader>
      <Collapse isOpen={isExpanded} data-parent="#accordion" id="collapseOne">
        <CardBody>
          <RelatedRecordsTable
            fieldConfig={unitDataMap[0]}
            data={data.atd_txdot_units}
            sortField={"unit_nbr"}
            tableName={"atd_txdot_units"}
            keyField={"unit_nbr"}
            lookupOptions={lookupSelectOptions}
            mutation={unitMutation}
            refetch={refetch}
            {...props}
          />
        </CardBody>
      </Collapse>
    </Card>
  );
};

export default UnitDetailsCard;
