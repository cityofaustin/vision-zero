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

  useEffect(() => {
    const searchText = searchParams.value
      ? `Search: ${searchParams.value}`
      : null;
    setSearchBadgeText(searchText);
  }, [searchParams]);

  useEffect(() => {
    console.log(dateRangeParams);
    const startDateRangeText = moment(dateRangeParams.startDate).format(
      "MM/DD/YYYY"
    );
    const endDateRangeText = moment(dateRangeParams.endDate).format(
      "MM/DD/YYYY"
    );
    const formattedDateRangeText = `Date: ${startDateRangeText} to ${endDateRangeText}`;
    setDateRangeBadgeText(formattedDateRangeText);
  }, [dateRangeParams]);

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
      </Col>
    </Row>
  );
};

export default GridTableFilterBadges;
