import React, { useState, useEffect } from "react";
import { withApollo } from "react-apollo";
import styled from "styled-components";
import { colors } from "../styles/colors";

const StyledGreyArrow = styled.i`
  color: ${colors.light};
  cursor: pointer;
`;

const StyledArrow = styled.i`
  cursor: pointer;
`;

const GridTableHeader = ({query, handleTableHeaderClick, sortColumn, sortOrder}) => {

    const renderLabel = (col, sortable=false, ascending=false) => {
        if(sortable) {
            return(<StyledArrow>
                <i className={`fa fa-arrow-circle-${ascending ? "up" : "down"}`} />
                &nbsp;{col}
            </StyledArrow>);
        }
        else {
            return (col);
        }
    };

    return (
        <thead>
        <tr>
            {query.columns.map((column, index) => (
                <th
                    onClick={query.isSortable(column) ? (e => handleTableHeaderClick(column)) : null}
                    key={`th-${index}`}>
                    {
                        renderLabel(
                            // Get a human-readable label string
                            query.getLabel(column, 'table'),
                            // If it is sortable, render as such
                            query.isSortable(column),
                            // If sort column is defined, use sort order, or false as default
                            sortColumn === column ? (sortOrder === "asc") : false)
                    }

                </th>
            ))}
        </tr>
        </thead>
    );
};

export default withApollo(GridTableHeader);
