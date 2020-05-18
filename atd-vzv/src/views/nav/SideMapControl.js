import React, { useEffect, useState } from "react";
import { StoreContext } from "../../utils/store";

import SideMapControlDateRange from "./SideMapControlDateRange";
import SideMapTimeOfDayChart from "./SideMapTimeOfDayChart";
import SideMapControlOverlays from "./SideMapControlOverlays";
import { trackPageEvent } from "../../constants/nav";
import { colors } from "../../constants/colors";
import { Button, Card, Label, Row, Col } from "reactstrap";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWalking,
  faBiking,
  faCar,
  faMotorcycle,
  faInfoCircle,
  faHeartbeat,
  faMedkit,
} from "@fortawesome/free-solid-svg-icons";

const StyledCard = styled.div`
  font-size: 1.2em;

  .card-title {
    font-weight: bold;
    color: ${colors.white};
  }

  .section-title {
    font-size: 1em;
    color: ${colors.dark};
  }

  .card-body {
    background: ${colors.white};
  }

  .info-icon {
    cursor: pointer;
  }

  .filter-button {
    min-width: 38px;
  }

  .type-button {
    font-size: 14px;
    color: ${colors.dark};
    background: ${colors.buttonBackground};
    border-style: none;
    border-radius: 18px;
    opacity: 1;
    margin-right: 2px;
    padding-right: 6px !important;
    height: 33px;
  }
`;

const SideMapControl = () => {
  const {
    mapFilters: [filters, setFilters],
    mapFilterType: [isMapTypeSet, setIsMapTypeSet],
  } = React.useContext(StoreContext);

  const [buttonFilters, setButtonFilters] = useState({});
  const [filterGroupCounts, setFilterGroupCounts] = useState({});

  const setTypeFilters = (typeArray) => {
    // Set types in array as true and others as false
    const updatedState = Object.keys(isMapTypeSet).reduce((acc, type) => {
      if (typeArray.includes(type)) {
        acc = { ...acc, [type]: true };
      } else {
        acc = { ...acc, [type]: false };
      }
      return acc;
    }, {});

    setIsMapTypeSet(updatedState);
  };

  const handleTypeFilterClick = (filterArr) => {
    setTypeFilters(filterArr);
    // Track single filter clicks with GA
    filterArr.length === 1 && trackPageEvent(filterArr[0]);
  };

  // Define groups of map button filters
  const mapButtonFilters = {
    type: {
      all: {
        text: `All`,
        handler: () => handleTypeFilterClick(["injury", "fatal"]),
        isSelected: isMapTypeSet.injury && isMapTypeSet.fatal,
        default: false,
        buttonClass: `type-button`,
      },
      fatal: {
        text: `Fatal`,
        colSize: "auto",
        icon: faHeartbeat,
        iconColor: colors.fatalities,
        handler: () => handleTypeFilterClick(["fatal"]),
        isSelected: isMapTypeSet.fatal && !isMapTypeSet.injury,
        default: false,
        buttonClass: `type-button`,
      },
      seriousInjury: {
        text: `Serious Injuries`,
        colSize: "auto",
        icon: faMedkit,
        iconColor: colors.seriousInjuries,
        handler: () => handleTypeFilterClick(["injury"]),
        isSelected: isMapTypeSet.injury && !isMapTypeSet.fatal,
        default: false,
        buttonClass: `type-button`,
      },
    },
    mode: {
      pedestrian: {
        icon: faWalking, // Font Awesome icon object
        fatalSyntax: `pedestrian_death_count > 0`, // Fatality query string
        injurySyntax: `pedestrian_serious_injury_count > 0`, // Injury query string
        type: `where`, // Socrata SoQL query type
        operator: `OR`, // Logical operator for joining multiple query strings
        default: true, // Apply filter as default on render
      },
      pedalcyclist: {
        icon: faBiking,
        fatalSyntax: `bicycle_death_count > 0`,
        injurySyntax: `bicycle_serious_injury_count > 0`,
        type: `where`,
        operator: `OR`,
        default: true,
      },
      motor: {
        icon: faCar,
        fatalSyntax: `motor_vehicle_death_count > 0`,
        injurySyntax: `motor_vehicle_serious_injury_count > 0`,
        type: `where`,
        operator: `OR`,
        default: true,
      },
      motorcycle: {
        icon: faMotorcycle,
        fatalSyntax: `motorcycle_death_count > 0`,
        injurySyntax: `motorcycle_serious_injury_count > 0`,
        type: `where`,
        operator: `OR`,
        default: true,
      },
      other: {
        text: "Other",
        fatalSyntax: `other_death_count > 0`,
        injurySyntax: `other_serious_injury_count > 0`,
        type: `where`,
        operator: `OR`,
        default: true,
      },
    },
  };

  const mapOtherFilters = {
    timeOfDay: {
      // Labels and corresponding time windows considering HH:00 to HH:59 notation
      "12AM–4AM": [0, 3],
      "4AM–8AM": [4, 7],
      "8AM–12PM": [8, 11],
      "12PM–4PM": [12, 15],
      "4PM–8PM": [16, 19],
      "8PM–12AM": [20, 23],
    },
  };

  // On inital render, reduce all default filters and apply to map data
  useEffect(() => {
    if (Object.keys(buttonFilters).length === 0) {
      const initialFiltersArray = Object.entries(mapButtonFilters).reduce(
        (allFiltersAccumulator, [type, filtersGroup]) => {
          const groupFilters = Object.entries(filtersGroup).reduce(
            (groupFiltersAccumulator, [name, filterConfig]) => {
              // Apply filter only if set as a default on render
              if (filterConfig.default) {
                filterConfig["name"] = name;
                filterConfig["group"] = type;
                groupFiltersAccumulator.push(filterConfig);
              }
              return groupFiltersAccumulator;
            },
            []
          );
          allFiltersAccumulator = [...allFiltersAccumulator, ...groupFilters];
          return allFiltersAccumulator;
        },
        []
      );
      setButtonFilters(initialFiltersArray);
    }
  }, [mapButtonFilters, setButtonFilters, buttonFilters]);

  // After inital render, create mode syntax and set filters state for map data
  useEffect(() => {
    if (Object.keys(buttonFilters).length !== 0) {
      const filterModeSyntaxByType = (filtersArray) =>
        filtersArray.map((filter) => {
          // Set syntax for generateWhereFilters() map helper
          if (isMapTypeSet.fatal && isMapTypeSet.injury) {
            filter.syntax = `${filter.fatalSyntax} ${filter.operator} ${filter.injurySyntax}`;
          } else if (isMapTypeSet.fatal) {
            filter.syntax = filter.fatalSyntax;
          } else if (isMapTypeSet.injury) {
            filter.syntax = filter.injurySyntax;
          }
          return filter;
        });

      const updatedFiltersArray = filterModeSyntaxByType(buttonFilters);
      setFilters(updatedFiltersArray);
    }
  }, [buttonFilters, isMapTypeSet, setFilters]);

  // Set count of filters applied per type
  useEffect(() => {
    const filtersCount = filters.reduce((accumulator, filter) => {
      if (accumulator[filter.group]) {
        accumulator = {
          ...accumulator,
          [filter.group]: accumulator[filter.group] + 1,
        };
      } else {
        accumulator = { ...accumulator, [filter.group]: 1 };
      }
      return accumulator;
    }, {});
    setFilterGroupCounts(filtersCount);
  }, [filters]);

  const isFilterSet = (filterName) => {
    return !!filters.find((setFilter) => setFilter.name === filterName);
  };

  const isOneFilterOfGroupApplied = (group) => filterGroupCounts[group] > 1;

  // Set filter or remove if already set
  const handleFilterClick = (event, filterGroup) => {
    const filterName = event.currentTarget.id;

    if (isFilterSet(filterName)) {
      // Always leave one filter applied per group
      let updatedFiltersArray = isOneFilterOfGroupApplied(filterGroup)
        ? filters.filter((setFilter) => setFilter.name !== filterName)
        : filters;
      setButtonFilters(updatedFiltersArray);
    } else {
      const filter = mapButtonFilters[filterGroup][filterName];
      // Add filterName and group to object for IDing and grouping
      filter["name"] = filterName;
      filter["group"] = filterGroup;
      const filtersArray = [...filters, filter];
      setButtonFilters(filtersArray);
    }
  };

  return (
    <StyledCard>
      <h4 className="card-title">
        Traffic Crashes{" "}
        <FontAwesomeIcon
          className="info-icon"
          icon={faInfoCircle}
          onClick={() => console.log("Clicked info circle")}
        />
      </h4>
      <Card className="p-3 card-body">
        <Label className="section-title">
          <h5>Filters</h5>
        </Label>
        {/* Create a button group for each group of mapFilters */}
        {Object.entries(mapButtonFilters).map(([group, groupParameters], i) => (
          <Row className="mx-0 mb-3" key={`${group}-buttons`}>
            {/* Create buttons for each filter within a group of mapFilters */}
            {Object.entries(groupParameters).map(([name, parameter], i) => (
              <Col
                xs={parameter.colSize && parameter.colSize}
                className="px-0"
                key={name}
              >
                <Button
                  key={name}
                  id={name}
                  color="dark"
                  className={`p-1 filter-button ${
                    parameter.buttonClass && parameter.buttonClass
                  }`}
                  onClick={
                    parameter.handler
                      ? parameter.handler
                      : (event) => handleFilterClick(event, group)
                  }
                  active={
                    parameter.isSelected
                      ? parameter.isSelected
                      : isFilterSet(name)
                  }
                  outline={
                    parameter.isSelected
                      ? !parameter.isSelected
                      : !isFilterSet(name)
                  }
                >
                  {parameter.icon && (
                    <FontAwesomeIcon
                      icon={parameter.icon}
                      className="mr-1 ml-1"
                      color={parameter.iconColor && parameter.iconColor}
                    />
                  )}
                  {parameter.text}
                </Button>
              </Col>
            ))}
          </Row>
        ))}
        <SideMapControlDateRange />
        <SideMapTimeOfDayChart filters={mapOtherFilters.timeOfDay} />
      </Card>
      <SideMapControlOverlays />
    </StyledCard>
  );
};

export default SideMapControl;
