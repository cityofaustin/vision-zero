import React, { useEffect, useState } from "react";
import { StoreContext } from "../../utils/store";
import "react-infinite-calendar/styles.css";

import SideMapControlDateRange from "./SideMapControlDateRange";
import SideMapControlOverlays from "./SideMapControlOverlays";
import { colors } from "../../constants/colors";
import { otherFiltersArray } from "../../constants/filters";
import { ButtonGroup, Button, Card, Label } from "reactstrap";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWalking,
  faBiking,
  faCar,
  faMotorcycle
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
`;

const SideMapControl = () => {
  const {
    mapFilters: [filters, setFilters]
  } = React.useContext(StoreContext);

  const [filterGroupCounts, setFilterGroupCounts] = useState({});

  // Build filter string for Other modes
  const buildOtherFiltersString = () =>
    otherFiltersArray
      .reduce((accumulator, filterString) => {
        accumulator.push(`${filterString} = "Y"`);
        return accumulator;
      }, [])
      .join(" OR ");

  // Define groups of map filters
  const mapFilters = {
    mode: {
      pedestrian: {
        icon: faWalking, // Font Awesome icon object
        syntax: `pedestrian_fl = "Y"`, // Socrata SoQL query string
        type: `where`, // Socrata SoQL query type
        operator: `OR`, // Logical operator for joining multiple query strings
        default: true // Apply filter as default on render
      },
      pedalcyclist: {
        icon: faBiking,
        syntax: `pedalcyclist_fl = "Y"`,
        type: `where`,
        operator: `OR`,
        default: true
      },
      motor: {
        icon: faCar,
        syntax: `motor_vehicle_fl = "Y"`,
        type: `where`,
        operator: `OR`,
        default: true
      },
      motorcycle: {
        icon: faMotorcycle,
        syntax: `motorcycle_fl = "Y"`,
        type: `where`,
        operator: `OR`,
        default: true
      },
      other: {
        text: "Other",
        syntax: buildOtherFiltersString(),
        type: `where`,
        operator: `OR`,
        default: true
      }
    },
    type: {
      seriousInjury: {
        text: `Injury`,
        syntax: `sus_serious_injry_cnt > 0`,
        type: `where`,
        operator: `OR`,
        default: true
      },
      fatal: {
        text: `Fatal`,
        syntax: `apd_confirmed_death_count > 0`,
        type: `where`,
        operator: `OR`,
        default: false
      }
    }
  };

  // Reduce all filters and set defaults as active on render
  useEffect(() => {
    // If no filters are applied (initial render), set all default filters
    if (Object.keys(filters).length === 0) {
      const initialFiltersArray = Object.entries(mapFilters).reduce(
        (accumulator, [type, filtersGroup]) => {
          const groupFilters = Object.entries(filtersGroup).reduce(
            (accumulator, [name, filterConfig]) => {
              // Apply filter only if set as a default on render
              if (filterConfig.default) {
                filterConfig["name"] = name;
                filterConfig["group"] = type;
                accumulator.push(filterConfig);
              }
              return accumulator;
            },
            []
          );
          accumulator = [...accumulator, ...groupFilters];
          return accumulator;
        },
        []
      );
      setFilters(initialFiltersArray);
    }
  }, [mapFilters, setFilters, filters]);

  // Set count of filters applied to keep one of each type applied at all times
  useEffect(() => {
    const filtersCount = filters.reduce((accumulator, filter) => {
      if (accumulator[filter.group]) {
        accumulator = {
          ...accumulator,
          [filter.group]: accumulator[filter.group] + 1
        };
      } else {
        accumulator = { ...accumulator, [filter.group]: 1 };
      }
      return accumulator;
    }, {});
    setFilterGroupCounts(filtersCount);
  }, [filters]);

  const isFilterSet = filterName => {
    return !!filters.find(setFilter => setFilter.name === filterName);
  };

  const isOneFilterOfGroupApplied = group => filterGroupCounts[group] > 1;

  // Set filter or remove if already set
  const handleFilterClick = (event, filterGroup) => {
    const filterName = event.currentTarget.id;

    if (isFilterSet(filterName)) {
      // Always leave one filter applied per group
      const updatedFiltersArray = isOneFilterOfGroupApplied(filterGroup)
        ? filters.filter(setFilter => setFilter.name !== filterName)
        : filters;
      setFilters(updatedFiltersArray);
    } else {
      const filter = mapFilters[filterGroup][filterName];
      // Add filterName and group to object for IDing and grouping
      filter["name"] = filterName;
      filter["group"] = filterGroup;
      const filtersArray = [...filters, filter];
      setFilters(filtersArray);
    }
  };

  return (
    <StyledCard>
      <div className="card-title">Traffic Crashes</div>
      <Card className="p-3 card-body">
        <Label className="section-title">Filters</Label>
        {/* Create a button group for each group of mapFilters */}
        {Object.entries(mapFilters).map(([group, groupParameters], i) => (
          <ButtonGroup key={i} className="mb-3 d-flex" id={`${group}-buttons`}>
            {/* Create buttons for each filter within a group of mapFilters */}
            {Object.entries(groupParameters).map(([name, parameter], i) => (
              <Button
                key={i}
                id={name}
                color="info"
                className="w-100 pt-1 pb-1 pl-0 pr-0"
                onClick={event => handleFilterClick(event, group)}
                active={isFilterSet(name)}
                outline={!isFilterSet(name)}
              >
                {parameter.icon && (
                  <FontAwesomeIcon
                    icon={parameter.icon}
                    className="mr-1 ml-1"
                  />
                )}
                {parameter.text}
              </Button>
            ))}
          </ButtonGroup>
        ))}
        <SideMapControlDateRange />
      </Card>
      <SideMapControlOverlays />
    </StyledCard>
  );
};

export default SideMapControl;
