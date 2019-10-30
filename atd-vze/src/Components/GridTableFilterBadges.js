import React, { useState, useEffect } from "react";

import { Col, Row, Badge } from "reactstrap";

const GridTableFilterBadges = ({
  searchParams,
  advancedFilterParams,
  dateRangeParams,
}) => {
  const [searchBadgeText, setSearchBadgeText] = useState(null);

  useEffect(() => {
    console.log(searchParams);
    const searchText = searchParams.value
      ? `Search: ${searchParams.value}`
      : null;
    setSearchBadgeText(searchText);
  }, [searchParams]);

  return (
    <Row className="mb-2">
      <Col>
        <span className="mr-1">Filters applied:</span>
        {searchBadgeText && (
          <Badge className="mr-1" color="primary">
            {searchBadgeText}
          </Badge>
        )}
      </Col>
    </Row>
  );
};

export default GridTableFilterBadges;
