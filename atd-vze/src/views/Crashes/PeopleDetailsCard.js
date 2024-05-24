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
import { GET_PEOPLE, UPDATE_PERSON } from "../../queries/people";

const PeopleDetailsCard = ({
  data,
  isExpanded,
  toggleAccordion,
  refetch,
  error,
  loading,
  ...props
}) => {
  const { data: lookupSelectOptions } = useQuery(GET_PERSON_LOOKUPS);

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  const primaryPersonData = data.filter(
    person => person.is_primary_person === true
  );

  const personData = data.filter(person => person.is_primary_person === false);

  const personMutation = {
    mutation: UPDATE_PERSON,
    variables: {
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
            <Badge color="secondary float-right">{data.length}</Badge>
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
            data={primaryPersonData}
            sortField={"unit_nbr"}
            tableName={"people_list_view"}
            keyField={"id"}
            lookupOptions={lookupSelectOptions}
            mutation={personMutation}
            refetch={refetch}
            {...props}
          />

          {personData.length > 0 && (
            <RelatedRecordsTable
              fieldConfig={personDataMap[0]}
              data={personData}
              sortField={"unit_nbr"}
              tableName={"people_list_view"}
              keyField={"id"}
              lookupOptions={lookupSelectOptions}
              mutation={personMutation}
              refetch={refetch}
              {...props}
            />
          )}
        </CardBody>
      </Collapse>
    </Card>
  );
};

export default PeopleDetailsCard;
