import React from "react";
import { StoreContext } from "../../utils/store";
import moment from "moment";
import DateRangePicker from "@wojtekmaj/react-daterange-picker";

import { colors } from "../../constants/colors";
import {
  mapStartDate,
  mapEndDate,
  mapDataMinDate,
  mapDataMaxDate
} from "../../constants/time";
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

  /* Make the date picker parent flex to keep calendar within Filter card */
  .react-daterange-picker {
    display: flex;
  }

  /* Set flex and give width to contain picker in card */
  .react-daterange-picker__wrapper {
    flex: 1 0 auto;
    width: 200px;
    /* Bootstrapify */
    border: 1px solid ${colors.info};
    border-radius: 5px;
    color: ${colors.dark};
    height: 32px;
    text-align: center;

    /* Set flex and give width to contain picker in card and center dates */
    .react-daterange-picker__inputGroup {
      flex: 1 0 auto;
      justify-content: center;
      min-width: 50px;
      font-size: 0.9em;
    }

    /* Center divider between date inputs */
    .react-daterange-picker__range-divider {
      padding-top: 3px;
      color: ${colors.dark};
    }

    /* Color x and calendar icons */
    svg {
      stroke: ${colors.info};
    }

    /* Color calendar icon when calendar is open */
    .react-daterange-picker__button:focus > svg {
      stroke: ${colors.infoDark};
    }
  }

  /* Bootstrapify and align colors in calendar */
  .react-calendar {
    font-size: 1em;
    background: ${colors.white};
    border: 1px solid ${colors.info};
    border-radius: 5px;

    /* Prevent word wrap */
    .react-calendar__month-view__weekdays {
      color: ${colors.dark};
      font-size: 0.65em;
    }

    /* Remove whitespace above weekdays */
    .react-calendar__navigation {
      margin-bottom: 0em;
    }

    /* Change selected day background */
    .react-calendar__tile--active {
      background: ${colors.info};
    }

    .react-calendar__tile--hasActive {
      background: ${colors.secondary};
    }
  }
`;

const SideMapControl = () => {
  const {
    mapFilters: [filters, setFilters],
    mapDateRange: [date, setDate]
  } = React.useContext(StoreContext);

  // Clear all filters that match group arg
  const handleAllFiltersClick = (event, group) => {
    const keepFilters = filters.filter(filter => filter.group !== group);
    setFilters(keepFilters);
  };

  // Determine if no filters in a group are applied (used for "All" buttons active/inactive state)
  const isUnfiltered = group => {
    const result = filters.filter(filter => filter.group === group);
    return result.length === 0;
  };

  // Define groups of map filters
  const mapFilters = {
    mode: {
      pedestrian: {
        icon: faWalking,
        syntax: `pedestrian_fl = "Y"`,
        type: `where`,
        operator: `OR`
      },
      pedalcyclist: {
        icon: faBiking,
        syntax: `pedalcyclist_fl = "Y"`,
        type: `where`,
        operator: `OR`
      },
      motor: {
        icon: faCar,
        syntax: `motor_vehicle_fl = "Y"`,
        type: `where`,
        operator: `OR`
      },
      motorcycle: {
        icon: faMotorcycle,
        syntax: `motorcycle_fl = "Y"`,
        type: `where`,
        operator: `OR`
      },
      all: {
        text: "All",
        handler: handleAllFiltersClick,
        active: isUnfiltered,
        inactive: isUnfiltered
      }
    },
    type: {
      seriousInjury: {
        text: `Injury`,
        syntax: `sus_serious_injry_cnt > 0`,
        type: `where`,
        operator: `AND`
      },
      fatal: {
        text: `Fatal`,
        syntax: `death_cnt > 0`,
        type: `where`,
        operator: `AND`
      }
    }
  };

  const handleFilterClick = (event, filterGroup) => {
    // Set filter or remove if already set
    const filterName = event.currentTarget.id;

    if (isFilterSet(filterName)) {
      const updatedFiltersArray = filters.filter(
        setFilter => setFilter.name !== filterName
      );
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

  const isFilterSet = filterName => {
    return !!filters.find(setFilter => setFilter.name === filterName);
  };

  const convertToDatePickerDateFormat = date => {
    const startDate = moment(date.start).format("MM/DD/YYYY");
    const endDate = moment(date.end).format("MM/DD/YYYY");
    return [new Date(startDate), new Date(endDate)];
  };

  // Called when date range changes OR when "x" is clicked to clear
  const convertToSocrataDateFormat = date => {
    // If date === null, "x" was clicked to clear. Reset to default range.
    if (date === null) {
      const updatedDates = { start: mapStartDate, end: mapEndDate };
      setDate(updatedDates);
    } else {
      const startDate = moment(date[0]).format("YYYY-MM-DD") + "T00:00:00";
      const endDate = moment(date[1]).format("YYYY-MM-DD") + "T23:59:59";
      const updatedDates = { start: startDate, end: endDate };
      setDate(updatedDates);
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
                // Use alternate handler if defined
                onClick={
                  parameter.handler
                    ? event => parameter.handler(event, group)
                    : event => handleFilterClick(event, group)
                }
                // Use alternate active/inactive fn if defined
                active={
                  parameter.active ? parameter.active(group) : isFilterSet(name)
                }
                outline={
                  parameter.inactive
                    ? !parameter.inactive(group)
                    : !isFilterSet(name)
                }
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
        {/* TODO: Add React Infinite Calendar component */}
        <DateRangePicker
          className="date-picker"
          value={convertToDatePickerDateFormat(date)}
          onChange={convertToSocrataDateFormat}
          minDate={mapDataMinDate}
          maxDate={mapDataMaxDate}
        />
      </Card>
    </StyledCard>
  );
};

export default SideMapControl;
