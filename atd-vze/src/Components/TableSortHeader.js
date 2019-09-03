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

const TableSortHeader = ({ setOrderFilter, fieldMap, columns }) => {
  const [sortColumn, setSortColumn] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  useEffect(() => {
    const orderQuery = () => {
      let queryStringArray = [];
      queryStringArray.push({
        ORDER_BY: `order_by: { ${sortColumn}: ${sortOrder} }`,
      });
      queryStringArray.push({ type: `Order` });
      return queryStringArray;
    };
    const queryStringArray = orderQuery();
    sortColumn !== "" && sortOrder !== "" && setOrderFilter(queryStringArray);
  }, [sortColumn, sortOrder, setOrderFilter]);

  const handleTableHeaderClick = col => {
    if (sortOrder === "" && sortColumn === "") {
      // First time sort is applied
      setSortOrder("asc");
      setSortColumn(col);
    } else if (sortColumn === col) {
      // Repeat sort on column
      sortOrder === "desc" ? setSortOrder("asc") : setSortOrder("desc");
    } else if (sortColumn !== col) {
      // Sort different column after initial sort
      setSortOrder("desc");
      setSortColumn(col);
    }
  };

  const convertFieldNameToTitle = col => {
    let title = "";
    fieldMap.map(
      field => (title = field.fields[col] ? field.fields[col] : title)
    );
    return title;
  };

  const renderSortArrow = col =>
    sortColumn === col ? (
      <StyledArrow>
        <i
          className={`fa fa-arrow-circle-${
            sortOrder === "asc" ? "up" : "down"
          }`}
        />
      </StyledArrow>
    ) : (
      <StyledGreyArrow>
        <i className={`fa fa-arrow-circle-up`} />
      </StyledGreyArrow>
    );

  return (
    <thead>
      <tr>
        {columns.map((col, i) => (
          <th onClick={e => handleTableHeaderClick(col)} key={`th-${i}`}>
            {renderSortArrow(col)} {convertFieldNameToTitle(col)}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default withApollo(TableSortHeader);
