import React, { useState, useEffect } from "react";
import { withApollo } from "react-apollo";
import styled from "styled-components";

const StyledGreyArrow = styled.i`
  color: #c8ced3;
`;

const TableSortHeader = ({ setOrderFilter, fieldMap, columns }) => {
  const [sortColumn, setSortColumn] = useState("crash_id");
  const [sortOrder, setSortOrder] = useState("desc");

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
    setOrderFilter(queryStringArray);
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
      <i
        className={`fa fa-arrow-circle-${sortOrder === "asc" ? "up" : "down"}`}
      />
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
