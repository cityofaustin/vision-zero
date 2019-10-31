import React, { useState, useEffect } from "react";
import moment from "moment";

import { Col, Row, Badge } from "reactstrap";

const GridTableFilterBadges = ({
  searchParams,
  dateRangeParams,
  advancedFilterParams,
  advancedFiltersConfig,
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
    const formattedDateRangeText = `${startDateRangeText} to ${endDateRangeText}`;

    setDateRangeBadgeText(formattedDateRangeText);
  }, [dateRangeParams]);

  // Update advanced filter badges text
  useEffect(() => {
    // Collect string names of all filters applied
    let advancedFilterText = [];
    Object.entries(advancedFilterParams).forEach(([filter, boolean]) => {
      boolean && advancedFilterText.push(filter);
    });

    const updateFiltersWithConfigLabels = filterTextArray => {
      // Create dictionary of filter names and labels from
      // filter configuration passed to GridTable
      const filterDictionary = {};
      Object.values(advancedFiltersConfig).forEach(filterGroup => {
        filterGroup.filters.forEach(filter => {
          filterDictionary[filter.id] = filter.label;
        });
      });

      // Use dictionary to translate filters
      return filterTextArray.map(filter => filterDictionary[filter]);
    };

    const humanReadableBadgeText = updateFiltersWithConfigLabels(
      advancedFilterText
    );
    setAdvancedFilterBadgeText(humanReadableBadgeText);
  }, [advancedFilterParams]);

  return (
    <>
      <Row className="mb-2">
        <Col>
          <h4>
            <i className="fa fa-calendar mr-2"></i>
            {dateRangeBadgeText && (
              <Badge className="mr-1" color="primary">
                {dateRangeBadgeText}
              </Badge>
            )}
          </h4>
        </Col>
      </Row>
      <Row className="mb-2">
        <Col>
          <h5>
            <i className="fa fa-lg fa-filter mr-2"></i>

            {searchBadgeText && (
              <Badge className="mr-1" color="primary">
                {searchBadgeText}
              </Badge>
            )}
            {advancedFilterBadgeText &&
              advancedFilterBadgeText.map(filter => (
                <Badge className="mr-1" color="primary">
                  {filter}
                </Badge>
              ))}
          </h5>
        </Col>
      </Row>
    </>
  );
};

export default GridTableFilterBadges;
