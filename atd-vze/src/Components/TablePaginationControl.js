import React, { useState, useEffect } from "react";
import { ButtonToolbar, Button, ButtonGroup } from "reactstrap";
import { withApollo } from "react-apollo";
import styled from "styled-components";

const StyledDisableClick = styled.i`
  pointer-events: none;
`;

const TablePaginationControl = ({ setPageFilter }) => {
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(100);
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    const pageQuery = () => {
      let queryStringArray = [];
      queryStringArray.push({ LIMIT: `limit: ${limit}` });
      queryStringArray.push({ OFFSET: `offset: ${offset}` });
      queryStringArray.push({ type: `Page` });
      return queryStringArray;
    };
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
    const queryStringArray = pageQuery();
    setPageFilter(queryStringArray);
  }, [limit, offset, setPageFilter]);

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
      pageOption.match("Next")
      // TODO find way to stop at last page
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
