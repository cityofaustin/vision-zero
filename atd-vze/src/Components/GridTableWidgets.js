import React, { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/react-hooks";

import { Container, Col, Row } from "reactstrap";
import Widget02 from "../views/Widgets/Widget02";

const GridTableWidgets = ({ query, queryConfig, widgetsConfig }) => {
  const [aggregateQuery, setAggregateQuery] = useState(null);

  const [loadAggData, { loading: aggLoading, data: aggData }] = useLazyQuery(
    aggregateQuery
  );

  // Update aggregate query with latest filters
  useEffect(() => {
    const aggregatesQuery = query.queryAggregate(queryConfig, query);
    // Prevent endlessly setting aggregateQuery
    if (aggregatesQuery !== aggregateQuery) {
      setAggregateQuery(aggregatesQuery);
    }
  });

  // Execute aggregate query each time it changes
  useEffect(() => {
    aggregateQuery !== null && loadAggData();
  }, [aggregateQuery]);

  const getAggregateData = field => {
    // If aggData is populated, use switch to return aggregate data
    if (aggData !== undefined && Object.keys(aggData).length > 0) {
      // In switch, using field in object reference if possible
      switch (field) {
        case "apd_confirmed_death_count":
          return aggData.atd_txdot_crashes_aggregate.aggregate.sum[field];
        case "sus_serious_injry_cnt":
          return (
            aggData.atd_txdot_primaryperson_aggregate.aggregate.sum
              .sus_serious_injry_cnt +
            aggData.atd_txdot_person_aggregate.aggregate.sum
              .sus_serious_injry_cnt
          );
        case "years_of_life_lost":
          return (
            aggData.atd_txdot_primaryperson_aggregate.aggregate.sum[field] +
            aggData.atd_txdot_person_aggregate.aggregate.sum[field]
          );
        case "count":
          return aggData.atd_txdot_crashes_aggregate.aggregate[field];
        case "total_people":
          return (
            aggData.atd_txdot_primaryperson_aggregate.aggregate.count +
            aggData.atd_txdot_person_aggregate.aggregate.count
          );
        case "total_units":
          return aggData.atd_txdot_units_aggregate.aggregate.count;
        default:
          console.log("no match");
      }
    } else {
      return "0";
    }
  };

  return (
    <Col>
      <Row>
        {widgetsConfig.map((widget, i) => (
          <Col key={i} xs="12" sm="6" md="4">
            <Widget02
              key={i}
              header={getAggregateData(widget.getAggregateDataArg)}
              mainText={widget.mainText}
              icon={widget.icon}
              color={widget.color}
            />
          </Col>
        ))}
      </Row>
    </Col>
  );
};

export default GridTableWidgets;
