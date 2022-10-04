import React, { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";

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
    const startDateRangeText = format(
      parseISO(dateRangeParams.startDate),
      "MM/dd/yyyy"
    );
    const endDateRangeText = format(
      parseISO(dateRangeParams.endDate),
      "MM/dd/yyyy"
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
  }, [advancedFilterParams, advancedFiltersConfig]);

  // Determine whether to show filter icon and filter badges in UI
  const hasFiltersApplied =
    advancedFilterBadgeText.length > 0 || searchBadgeText;

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
          {hasFiltersApplied && (
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
          )}
        </Col>
      </Row>
    </>
  );
};

export default GridTableFilterBadges;
