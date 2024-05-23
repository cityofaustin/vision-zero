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

import { primaryPersonDataMap, personDataMap } from "./peopleDataMap";
import { GET_PERSON_LOOKUPS } from "../../queries/lookups";
import {
  GET_PEOPLE,
  UPDATE_PRIMARYPERSON,
  UPDATE_PERSON,
} from "../../queries/people";

const PeopleDetailsCard = ({ isExpanded, toggleAccordion, ...props }) => {
  const crashId = props.match.params.id;

  const { data: lookupSelectOptions } = useQuery(GET_PERSON_LOOKUPS);
  const { loading, error, data, refetch } = useQuery(GET_PEOPLE, {
    variables: { crashId },
  });

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  const personMutation = {
    mutation: UPDATE_PERSON,
    variables: {
      crashId: crashId,
      personId: "",
      changes: {},
    },
  };

  const primaryPersonMutation = {
    mutation: UPDATE_PRIMARYPERSON,
    variables: {
      crashId: crashId,
      personId: "",
      changes: {},
    },
  };

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
              {data.people_list_view.length}
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
          <RelatedRecordsTable
            fieldConfig={primaryPersonDataMap[0]}
            data={data.people_list_view}
            sortField={"unit_nbr"}
            tableName={"people_list_view"}
            keyField={"id"}
            lookupOptions={lookupSelectOptions}
            mutation={primaryPersonMutation}
            refetch={refetch}
            {...props}
          />
          {/* 
          {data.atd_txdot_person.length > 0 && (
            <RelatedRecordsTable
              fieldConfig={personDataMap[0]}
              data={data.atd_txdot_person}
              sortField={"person_id"}
              tableName={"people_list_view"}
              keyField={"person_id"}
              lookupOptions={lookupSelectOptions}
              mutation={personMutation}
              refetch={refetch}
              {...props}
            />
          )} */}
        </CardBody>
      </Collapse>
    </Card>
  );
};

export default PeopleDetailsCard;
