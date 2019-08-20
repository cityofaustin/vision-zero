import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/react-hooks";
import { withApollo } from "react-apollo";
import { gql } from "apollo-boost";

const TableSortHeader = props => {
  const [sortColumn, setSortColumn] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  const addSortToQuery = () => {
    let queryWithSort =
      sortColumn !== ""
        ? props.queryString.replace(
            "ORDER_BY",
            `order_by: { ${sortColumn}: ${sortOrder} }`
          )
        : props.queryString.replace("ORDER_BY", "");
    return gql`
      ${queryWithSort}
    `;
  };

  const { loading: sortLoading, error: sortError, data: sortData } = useQuery(
    addSortToQuery()
  );

  useEffect(() => {
    props.updateTableData(sortData, true);
  }, [sortData]);

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
    props.fieldMap.map(field => {
      title = field.fields[col] ? field.fields[col] : title;
    });
    return title;
  };

  // Add greyed-out arrow to indicate that sort is possible
  const renderSortArrow = col =>
    sortColumn === col ? (
      <i
        className={`fa fa-arrow-circle-${sortOrder === "asc" ? "up" : "down"}`}
      />
    ) : null;

  return (
    <thead>
      <tr>
        {props.columns.map((col, i) => (
          <th onClick={e => handleTableHeaderClick(col)} key={`th-${i}`}>
            {renderSortArrow(col)} {convertFieldNameToTitle(col)}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default withApollo(TableSortHeader);
