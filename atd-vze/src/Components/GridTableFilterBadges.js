import React, { useState, useEffect } from "react";
import moment from "moment";

import { Col, Row, Badge } from "reactstrap";

const GridTableFilterBadges = ({
  searchParams,
  advancedFilterParams,
  dateRangeParams,
}) => {
  const [searchBadgeText, setSearchBadgeText] = useState(null);
  const [dateRangeBadgeText, setDateRangeBadgeText] = useState(null);
  const [advancedFilterBadgeText, setAdvancedFilterBadgeText] = useState([]);

  // Update search badge text
  useEffect(() => {
    const searchText = searchParams.value
      ? `Search: ${searchParams.value}`
      : null;
    setSearchBadgeText(searchText);
  }, [searchParams]);

  // Update date range badge text
  useEffect(() => {
    const startDateRangeText = moment(dateRangeParams.startDate).format(
      "MM/DD/YYYY"
    );
    const endDateRangeText = moment(dateRangeParams.endDate).format(
      "MM/DD/YYYY"
    );
    const formattedDateRangeText = `Date: ${startDateRangeText} to ${endDateRangeText}`;
    setDateRangeBadgeText(formattedDateRangeText);
  }, [dateRangeParams]);

  // Update advanced filter badges text
  useEffect(() => {
    let advancedFilterText = [];
    Object.entries(advancedFilterParams).forEach(([key, value]) => {
      value && advancedFilterText.push(key);
    });
    setAdvancedFilterBadgeText(advancedFilterText);
  }, [advancedFilterParams]);

  return (
    <Row className="mb-2">
      <Col>
        <span className="mr-1">Filters applied:</span>
        {searchBadgeText && (
          <Badge className="mr-1" color="primary">
            {searchBadgeText}
          </Badge>
        )}
        {dateRangeBadgeText && (
          <Badge className="mr-1" color="primary">
            {dateRangeBadgeText}
          </Badge>
        )}
        {/* TODO: translate badge names into human readable strings */}
        {advancedFilterBadgeText &&
          advancedFilterBadgeText.map(filter => (
            <Badge className="mr-1" color="primary">
              {filter}
            </Badge>
          ))}
      </Col>
    </Row>
  );
};

export default GridTableFilterBadges;
