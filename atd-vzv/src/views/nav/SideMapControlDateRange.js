import React, { useState, useEffect } from "react";
import { StoreContext } from "../../utils/store";
import ThemedStyleSheet from "react-with-styles/lib/ThemedStyleSheet";
import aphroditeInterface from "react-with-styles-interface-aphrodite";
import DefaultTheme from "react-dates/lib/theme/DefaultTheme";
import styled from "styled-components";
import { DateRangePicker } from "react-dates";
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
  useCanTwoMonthsFit,
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

  const handleDateChange = (dates) => {
    let { startDate, endDate } = dates;

    startDate =
      // If startDate is not null and before n year window, set to dataStartDate
      (!!startDate &&
        startDate.isBefore(dataStartDate, "day") &&
        dataStartDate) ||
      startDate;

    endDate =
      // If endDate is not null and after n year window, set to dataEndDate
      (!!endDate && endDate.isAfter(dataEndDate, "day") && dataEndDate) ||
      endDate;

    setStart(startDate);
    setEnd(endDate);
  };

  // Check if date is outside n year rolling window
  const isOutsideDateLimits = (date) =>
    date.isBefore(dataStartDate, "day") || date.isAfter(dataEndDate, "day");

  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const canTwoMonthsFit = useCanTwoMonthsFit();

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
    for (let i = dataStartDate.year(); i <= dataEndDate.year(); i++) {
      yearArray.push(i);
    }

    return (
      <StyledMonthYearDropdown>
        <DropdownToggle caret color="dark">
          {month.format("MMMM YYYY")}
        </DropdownToggle>
        <DropdownMenu flip={false}>
          <DropdownItem header className="dropdown-header">
            Choose a year
          </DropdownItem>
          {yearArray.map((year) => (
            <DropdownItem
              key={`${month.format("MMMM")}-${year}`}
              onClick={() => {
                onYearSelect(month, year);
              }}
            >
              {month.format("MMMM")} {year}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </StyledMonthYearDropdown>
    );
  };

  // Create and style custom close button (for mobile full screen view)
  const StyledCalendarInfo = styled.div`
    position: absolute;
    right: 10px;
    top: 10px;
    z-index: 1304;
    background: ${colors.white};
  `;

  const renderCalendarInfo = () => (
    <StyledCalendarInfo>
      <FontAwesomeIcon
        icon={faTimesCircle}
        color={colors.dark}
        size="2x"
        onClick={() => setFocused(null)}
      />
    </StyledCalendarInfo>
  );

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
    <StyledButtonContainer className="pr-0 picker-outline">
      <DateRangePicker
        startDateId={`start_date_${type}`} // PropTypes.string.isRequired,
        endDateId={`end_date_${type}`} // PropTypes.string.isRequired,
        startDate={start} // momentPropTypes.momentObj or null,
        endDate={end} // momentPropTypes.momentObj or null,
        onDatesChange={handleDateChange} // PropTypes.func.isRequired,
        focusedInput={focused} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
        onFocusChange={(focusedInput) => {
          setFocused(focusedInput);
          isTablet && document.activeElement.blur(); // Do not prompt the keyboard on mobile/tablet
        }} // PropTypes.func.isRequired,
        keepFocusOnInput
        minDate={dataStartDate}
        maxDate={dataEndDate}
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
      />
      {/* Show reset button to restore default date range or show calendar icon if default*/}
      {start !== mapStartDate || end !== mapEndDate ? (
        <StyledRedoButton
          title="Reset to default date range"
          icon={faRedoAlt}
          color={colors.dark}
          onClick={() => {
            setStart(mapStartDate);
            setEnd(mapEndDate);
          }}
        />
      ) : (
        <StyledCalendarIcon
          title="Default date range"
          icon={faCalendar}
          color={colors.dark}
          onClick={() => null}
        />
      )}
    </StyledButtonContainer>
  );
};

export default SideMapControlDateRange;
