import React, { useState, useEffect } from "react";
import {
  ButtonToolbar,
  Button,
  ButtonGroup,
  ButtonDropdown,
  DropdownMenu,
  DropdownToggle,
  DropdownItem,
} from "reactstrap";
import { withApollo } from "react-apollo";
import styled from "styled-components";

const StyledDisableClick = styled.i`
  pointer-events: none;
`;

const rowsPerPage = [10, 25, 50, 100, 250, 500];

const TablePaginationControl = ({ setPageFilter }) => {
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(100);
  const [pageNumber, setPageNumber] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
        pageNumber = Math.floor(offset / limit) + 1;
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
      // Prevent offset from being set between 0 and the limit
      // so that Page 1 always starts with first record after changing rows per page
      decreasedOffset >= 0 && offset % limit === 0
        ? setOffset(decreasedOffset)
        : setOffset(0);
    }
    if (offset === 0 && pageOption.match("Prev")) {
      return null;
    }
    if (pageOption.match("Next")) {
      const increasedOffset = offset + limit;
      setOffset(increasedOffset);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleRowClick = e => {
    const rowNumber = parseInt(e.target.value);
    setLimit(rowNumber);
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
          <StyledDisableClick>
            <Button color="light">Page {pageNumber}</Button>
          </StyledDisableClick>
          <Button onClick={updatePage}>
            Next{" "}
            <StyledDisableClick>
              <i className="fa fa-arrow-circle-right" />
            </StyledDisableClick>
          </Button>
        </ButtonGroup>
        <ButtonDropdown
          className="ml-2 mr-1"
          isOpen={isDropdownOpen}
          toggle={toggleDropdown}
        >
          <DropdownToggle caret color="secondary">
            Rows per page
          </DropdownToggle>
          <DropdownMenu>
            {rowsPerPage.map(rows => (
              <DropdownItem
                onClick={handleRowClick}
                value={rows}
                key={`rows-${rows}`}
                className={rows === limit ? "font-weight-bold" : ""}
              >
                {rows}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </ButtonDropdown>
      </ButtonToolbar>
      <br />
    </>
  );
};

export default withApollo(TablePaginationControl);
