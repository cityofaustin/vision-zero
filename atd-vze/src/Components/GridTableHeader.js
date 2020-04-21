import React from "react";
import { withApollo } from "react-apollo";
import styled from "styled-components";

const StyledArrow = styled.i`
  cursor: pointer;
`;

const GridTableHeader = ({
  query,
  handleTableHeaderClick,
  sortColumn,
  sortOrder,
  helperText,
}) => {
  /**
   * Renders a label with sorting icons going up or down
   * @param {string} col - the name of the column (label)
   * @param {boolean} sortable - true if the column is sortable
   * @param {boolean} ascending - true if ordering in ascending mode
   * @returns {object} jsx component
   */
  const renderLabel = (col, sortable = false, ascending = false) => {
    if (sortable) {
      return (
        <StyledArrow>
          <i className={`fa fa-arrow-circle-${ascending ? "up" : "down"}`} />
          &nbsp;{col}
        </StyledArrow>
      );
    } else {
      return col;
    }
  };

  const colspan = query.columns.length;

  return (
    <>
      <thead>
        {helperText && (
          <tr>
            <th colspan={colspan}>
              <small class="pull-right">{helperText}</small>
            </th>
          </tr>
        )}
        <tr>
          {query.columns.map(
            (column, index) =>
              // If column is hidden, don't render <th>
              !query.isHidden(column) && (
                <th
                  onClick={
                    query.isSortable(column)
                      ? e => handleTableHeaderClick(column)
                      : null
                  }
                  key={`th-${index}`}
                >
                  {renderLabel(
                    // Get a human-readable label string
                    query.getLabel(column, "table"),
                    // If it is sortable, render as such
                    query.isSortable(column),
                    // If sort column is defined, use sort order, or false as default
                    sortColumn === column ? sortOrder === "asc" : false
                  )}
                </th>
              )
          )}
        </tr>
      </thead>
    </>
  );
};

export default withApollo(GridTableHeader);
