import React, { useState, useEffect } from "react";
import { ButtonToolbar, Button, ButtonGroup } from "reactstrap";

import { useQuery } from "@apollo/react-hooks";
import { withApollo } from "react-apollo";
import { gql } from "apollo-boost";
import styled from "styled-components";

const StyledDisableClick = styled.i`
  pointer-events: none;
`;

const TablePaginationControl = props => {
  const updateResults = props.updateResults;

  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(100);
  const [pageNumber, setPageNumber] = useState(1);

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
    updateResults(pageData);
    const updatePageNumber = () => {
      let pageNumber = "";
      if (offset === 0) {
        pageNumber = 1;
        setPageNumber(pageNumber);
      } else {
        pageNumber = offset / limit + 1;
        setPageNumber(pageNumber);
      }
    };
    updatePageNumber();
  }, [pageData, limit, offset, updateResults]);

  const updatePage = e => {
    const pageOption = e.target.innerText;
    if (offset !== 0 && pageOption.match("Prev")) {
      const decreasedOffset = offset - limit;
      setOffset(decreasedOffset);
    }
    if (offset === 0 && pageOption.match("Prev")) {
      return null;
    }
    if (
      pageOption.match("Next") &&
      pageData[props.responseDataSet].length === limit
    ) {
      const increasedOffset = offset + limit;
      setOffset(increasedOffset);
    }
  };

  return (
    <>
      <ButtonToolbar className="">
        <ButtonGroup>
          <Button onClick={updatePage}>
            <StyledDisableClick>
              <i className="fa fa-arrow-circle-left" />
            </StyledDisableClick>{" "}
            Prev
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <StyledDisableClick>
            <Button color="light">Page {pageNumber}</Button>
          </StyledDisableClick>
        </ButtonGroup>
        <ButtonGroup>
          <Button onClick={updatePage}>
            Next{" "}
            <StyledDisableClick>
              <i className="fa fa-arrow-circle-right" />
            </StyledDisableClick>
          </Button>
        </ButtonGroup>
      </ButtonToolbar>
      <br />
    </>
  );
};

export default withApollo(TablePaginationControl);
