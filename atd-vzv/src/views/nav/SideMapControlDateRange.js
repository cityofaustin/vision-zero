import React, { useState, useEffect } from "react";
import { StoreContext } from "../../utils/store";
import ThemedStyleSheet from "react-with-styles/lib/ThemedStyleSheet";
import aphroditeInterface from "react-with-styles-interface-aphrodite";
import DefaultTheme from "react-dates/lib/theme/DefaultTheme";
import styled from "styled-components";
import { DateRangePicker } from "react-dates";
import { Input, FormGroup, Form, Col } from "reactstrap";
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
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";

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
  const renderMonthElement = ({ month, onYearSelect }) => {
    let yearArray = [];
    for (let i = dataStartDate.year(); i <= dataEndDate.year(); i++) {
      yearArray.push(i);
    }

    return (
      <Form className="form-inline justify-content-center">
        <FormGroup row className="w-75">
          <Col>
            <Input
              type="select"
              name="select"
              id="yearSelect"
              value={month.year()}
              onChange={(e) => {
                onYearSelect(month, e.target.value);
              }}
            >
              {yearArray.map((year) => (
                <option value={year}>
                  {month.format("MMMM")} {year}
                </option>
              ))}
            </Input>
          </Col>
        </FormGroup>
      </Form>
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

    /* Center and enlarge picker reset button */
    .reset-button {
      position: relative;
      top: 5px;
      right: 2px;
      width: 22px;
      height: 22px;
      cursor: pointer;
    }
  `;

  return (
    <StyledButtonContainer className="pr-0 picker-outline w-100">
      <DateRangePicker
        startDateId={`start_date_${type}`} // PropTypes.string.isRequired,
        endDateId={`end_date_${type}`} // PropTypes.string.isRequired,
        startDate={start} // momentPropTypes.momentObj or null,
        endDate={end} // momentPropTypes.momentObj or null,
        onDatesChange={handleDateChange} // PropTypes.func.isRequired,
        focusedInput={focused} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
        onFocusChange={(focusedInput) => setFocused(focusedInput)} // PropTypes.func.isRequired,
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
      {/* Reset button to restore default date range */}
      <FontAwesomeIcon
        className="reset-button"
        title="Reset to current year"
        icon={faTimesCircle}
        color={colors.dark}
        onClick={() => {
          setStart(mapStartDate);
          setEnd(mapEndDate);
        }}
      />
    </StyledButtonContainer>
  );
};

export default SideMapControlDateRange;
