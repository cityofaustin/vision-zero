import React, { useState, useEffect } from "react";
import { StoreContext } from "src/constants/context";
import ThemedStyleSheet from "react-with-styles/lib/ThemedStyleSheet";
import aphroditeInterface from "react-with-styles-interface-aphrodite";
import DefaultTheme from "react-dates/lib/theme/DefaultTheme";
import styled from "styled-components";
import { DateRangePicker } from "react-dates";
import { format, getYear } from "date-fns";
import {
  UncontrolledDropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";
import {
  dataStartDate,
  dataEndDate,
  mapStartDate,
  mapEndDate,
} from "../../constants/time";
import { colors } from "../../constants/colors";
import {
  useIsTablet,
  useIsMobile,
} from "../../constants/responsive";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRedoAlt,
  faTimesCircle,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";

const SideMapControlDateRange = ({ type }) => {
  const [focused, setFocused] = useState(null);
  const [start, setStart] = useState(mapStartDate);
  const [end, setEnd] = useState(mapEndDate);

  /**
   * We need to calculate the width differently in windows, by a few pixels.
   * Windows = 94px, everyone else: 99px
   */
  const inputWidth = navigator.appVersion.indexOf("Win") !== -1 ? 92 : 99;

  // Override defaultTheme https://github.com/airbnb/react-dates/blob/master/src/theme/DefaultTheme.js
  const vzTheme = {
    reactDates: {
      ...DefaultTheme.reactDates,
      zIndex: 1301, // MUI SideDrawer is 1300 so need to exceed to show picker
      border: {
        ...DefaultTheme.reactDates.border,
        input: {
          ...DefaultTheme.reactDates.border.input,
          borderBottomFocused: `2px solid ${colors.dark}`,
        },
        pickerInput: {
          ...DefaultTheme.reactDates.border.pickerInput,
          borderWidth: 0, // Remove any space between picker and StyledButtonContainer
        },
      },
      color: {
        ...DefaultTheme.reactDates.color,
        placeholderText: `${colors.dark}`, // Set to same color as .dropdown-header to overcome z-index issue (hide text)
        border: `transparent`, // Hide DateRangePicker border and show StyledButtonContainer instead
        selected: {
          backgroundColor: `${colors.dark}`,
          backgroundColor_active: `${colors.dark}`,
          backgroundColor_hover: `${colors.dark}`,
          borderColor: `${colors.light}`,
          borderColor_active: `${colors.light}`,
          borderColor_hover: `${colors.light}`,
          color: `${colors.light}`,
          color_active: `${colors.light}`,
          color_hover: `${colors.light}`,
        },
        selectedSpan: {
          backgroundColor: `${colors.secondary}`,
          backgroundColor_active: `${colors.secondary}`,
          backgroundColor_hover: `${colors.dark}`,
          borderColor: `${colors.light}`,
          borderColor_active: `${colors.light}`,
          borderColor_hover: `${colors.light}`,
          color: `${colors.dark}`,
          color_active: `${colors.light}`,
          color_hover: `${colors.light}`,
        },
        hoveredSpan: {
          backgroundColor: `${colors.secondary}`,
          backgroundColor_active: `${colors.dark}`,
          backgroundColor_hover: `${colors.dark}`,
          borderColor: `${colors.light}`,
          borderColor_active: `${colors.light}`,
          borderColor_hover: `${colors.light}`,
          color: `${colors.dark}`,
          color_active: `${colors.light}`,
          color_hover: `${colors.light}`,
        },
      },
      sizing: {
        inputWidth: 90,
        inputWidth_small: inputWidth,
        arrowWidth: 10,
      },
      spacing: {
        ...DefaultTheme.reactDates.spacing,
        displayTextPaddingLeft_small: 4,
        displayTextPaddingRight_small: 4,
        displayTextPaddingBottom_small: 4,
      },
    },
  };

  ThemedStyleSheet.registerTheme(vzTheme);
  ThemedStyleSheet.registerInterface(aphroditeInterface);

  const { setMapDateRange: setMapDate } = React.useContext(StoreContext);

  // Update map date range in Context when picker dates update
  useEffect(() => {
    setMapDate({ start, end });
  }, [start, end, setMapDate]);

  const handleStartDateChange = (date) => {
    if (!date) {
      setStart(mapStartDate);
    } else {
      setStart(date);
    }
  };

  const handleEndDateChange = (date) => {
    if (!date) {
      setEnd(mapEndDate);
    } else {
      setEnd(date);
    }
  };

  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  // Create year dropdown picker in calendar
  const StyledMonthYearDropdown = styled(UncontrolledDropdown)`
    .dropdown-header {
      /* Set color and position to hide weekday calendar headers with unchangeable z-index */
      background: ${colors.dark};
      color: ${colors.white};
      position: relative;
      top: -2px;
    }
  `;

  const renderMonthElement = ({ month, onYearSelect }) => {
    let yearArray = [];
    for (let i = getYear(dataStartDate); i <= getYear(dataEndDate); i++) {
      yearArray.push(i);
    }

    return (
      <StyledMonthYearDropdown>
        <DropdownToggle caret color="dark">
          {format(new Date(month), "MMMM yyyy")}
        </DropdownToggle>
        <DropdownMenu flip={false}>
          <DropdownItem header className="dropdown-header">
            Choose a year
          </DropdownItem>
          {yearArray.map((year) => (
            <DropdownItem
              key={`${format(new Date(month), "MMMM")}-${year}`}
              onClick={() => {
                onYearSelect(month, year);
              }}
            >
              {format(new Date(month), "MMMM")} {year}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </StyledMonthYearDropdown>
    );
  };

  const StyledButtonContainer = styled.div`
    /* Mock a Bootstrap outline button */
    border: 1px solid ${colors.dark};
    height: 34px;
    border-radius: 4px;
    padding-left: 2px;

    /* Center start and end date inputs */
    [id^="start_date_"],
    [id^="end_date_"] {
      text-align: center;
    }
  `;

  // Center and size calendar icon or button
  const calendarInputIconStyles = `position: relative;
    top: 2px;
    width: 16px;
    height: 16px;`;

  const StyledCalendarIcon = styled(FontAwesomeIcon)`
    ${calendarInputIconStyles}
    left: 1px;
  `;

  const StyledRedoButton = styled(FontAwesomeIcon)`
    ${calendarInputIconStyles}
    right: 1px;
    cursor: pointer;
  `;

  return (
    <StyledButtonContainer className="pe-0 picker-outline">
      {/** address that is closes when clicking */}
      <input
        type="date"
        id="map-start-date"
        name="map-start"
        value={start ?? mapStartDate}
        min={mapStartDate}
        max={mapEndDate}
        onChange={(e) => setStart(e.target.value)}
      />
      <input
        type="date"
        id="map-end-date"
        name="map-end"
        value={end ?? mapEndDate}
        min={mapStartDate}
        max={mapEndDate}
        onChange={(e) => handleEndDateChange(e.target.value)}
      />
      {/* <DateRangePicker
        startDateId={`start_date_${type}`} // PropTypes.string.isRequired,
        endDateId={`end_date_${type}`} // PropTypes.string.isRequired,
        startDate={start} // momentPropTypes.momentObj or null,
        endDate={end} // momentPropTypes.momentObj or null,
        onDatesChange={handleDateChange} // PropTypes.func.isRequired,
        focusedInput={focused} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
        onFocusChange={(focusedInput) => {
          setFocused(focusedInput);
          // Do not prompt the keyboard on mobile/tablet
          if (isTablet) {
            document.activeElement.blur();
          }
        }} // PropTypes.func.isRequired,
        keepFocusOnInput
        minDate={moment(dataStartDate)}
        maxDate={moment(dataEndDate)}
        renderCalendarInfo={() => (isMobile && renderCalendarInfo()) || true} // Render custom close button on mobile
        calendarInfoPosition="top" // Position custom close button
        appendToBody // Allow calendar to pop out over SideDrawer and Map components
        withFullScreenPortal={isMobile} // Show full screen picker on mobile
        small
        renderMonthElement={renderMonthElement} // Render year picker
        orientation={isMobile ? "vertical" : "horizontal"} // More mobile friendly than horizontal
        isOutsideRange={() => false} // Enable past dates
        isDayBlocked={isOutsideDateLimits} // Grey out dates
        numberOfMonths={!canTwoMonthsFit || (isTablet && !isMobile) ? 1 : 2}
      /> */}
      {/* Show reset button to restore default date range */}
      {(start !== mapStartDate || end !== mapEndDate) && (
        <StyledRedoButton
          title="Reset to default date range"
          icon={faRedoAlt}
          color={colors.dark}
          onClick={() => {
            setStart(mapStartDate);
            setEnd(mapEndDate);
          }}
        />
      ) }
    </StyledButtonContainer>
  );
};

export default SideMapControlDateRange;
