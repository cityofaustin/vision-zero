import React, { useState, useEffect } from "react";

import { Col, Row, Badge } from "reactstrap";

const GridTableFilterBadges = ({
  searchParams,
  advancedFilterParams,
  advancedFiltersConfig,
}) => {
  const [searchBadgeText, setSearchBadgeText] = useState(null);
  const [advancedFilterBadgeText, setAdvancedFilterBadgeText] = useState([]);

  // Update search badge text
  useEffect(() => {
    const searchText = searchParams.value
      ? `Search: ${searchParams.value}`
      : null;

    setSearchBadgeText(searchText);
  }, [searchParams]);

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
                  <Badge key={filter} className="mr-1" color="primary">
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
