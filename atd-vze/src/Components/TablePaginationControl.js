import React, { useState, useEffect } from "react";
import { ButtonToolbar, Button, ButtonGroup } from "reactstrap";

import { useQuery } from "@apollo/react-hooks";
import { withApollo } from "react-apollo";
import { gql } from "apollo-boost";

const TableSearchBar = props => {
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(100);

  const pageQuery = () => {
    let queryWithPage = props.queryString.replace("LIMIT", `limit: ${limit}`);
    queryWithPage = queryWithPage.replace("OFFSET", `offset: ${offset}`);
    return gql`
      ${queryWithPage}
    `;
  };

  const { loading: pageLoading, error: pageError, data: pageData } = useQuery(
    pageQuery()
  );

  useEffect(() => {
    props.updateResults(pageData);
  }, [pageData]);

  const updatePage = e => {
    const pageOption = e.target.innerText;
    if (offset !== 0 && pageOption === "Prev") {
      const decreasedOffset = offset - limit;
      setOffset(decreasedOffset);
    }
    if (offset === 0 && pageOption === "Prev") {
      return null;
    }
    if (pageOption === "Next") {
      const increasedOffset = offset + limit;
      setOffset(increasedOffset);
    }
  };

  return (
    <ButtonToolbar className="justify-content-between">
      <ButtonGroup>
        <Button onClick={updatePage}>
          Prev <i className="fa fa-arrow-circle-left" />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button onClick={updatePage}>
          Next <i className="fa fa-arrow-circle-right" />
        </Button>
      </ButtonGroup>
    </ButtonToolbar>
  );
};

export default withApollo(TableSearchBar);
