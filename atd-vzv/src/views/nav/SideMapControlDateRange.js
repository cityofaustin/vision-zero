import React, { useState, useEffect } from "react";
import { StoreContext } from "../../utils/store";
import ThemedStyleSheet from "react-with-styles/lib/ThemedStyleSheet";
import aphroditeInterface from "react-with-styles-interface-aphrodite";
import DefaultTheme from "react-dates/lib/theme/DefaultTheme";
import styled from "styled-components";
import { DateRangePicker } from "react-dates";
import { Input, FormGroup, Form, Col } from "reactstrap";
import { dataStartDate, dataEndDate } from "../../constants/time";
import { colors } from "../../constants/colors";
import { responsive } from "../../constants/responsive";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";

const SideMapControlDateRange = () => {
  const [focused, setFocused] = useState(null);
  const [start, setStart] = useState(dataStartDate);
  const [end, setEnd] = useState(dataEndDate);

  const vzTheme = {
    reactDates: {
      ...DefaultTheme.reactDates,
      zIndex: 1301, // MUI SideDrawer is 1300 so need to exceed to show picker
      border: {
        ...DefaultTheme.reactDates.border,
        input: {
          ...DefaultTheme.reactDates.border.input,
          borderBottomFocused: `2px solid ${colors.infoDark}`
        },
        pickerInput: {
          ...DefaultTheme.reactDates.border.pickerInput,
          borderRadius: 4 // Match Bootstrap style
        }
      },
      color: {
        ...DefaultTheme.reactDates.color,
        // Prevent background breaking through border when not focused, when focused need calendar background to be set
        background: `${focused ? colors.white : "transparent"}`,
        border: `${colors.info}`,
        backgroundFocused: `${focused ? colors.white : "transparent"}`,
        selected: {
          backgroundColor: `${colors.infoDark}`,
          backgroundColor_active: `${colors.infoDark}`,
          backgroundColor_hover: `${colors.infoDark}`,
          borderColor: `${colors.light}`,
          borderColor_active: `${colors.light}`,
          borderColor_hover: `${colors.light}`,
          color: `${colors.light}`,
          color_active: `${colors.light}`,
          color_hover: `${colors.light}`
        },
        selectedSpan: {
          backgroundColor: `${colors.info}`,
          backgroundColor_active: `${colors.info}`,
          backgroundColor_hover: `${colors.infoDark}`,
          borderColor: `${colors.light}`,
          borderColor_active: `${colors.light}`,
          borderColor_hover: `${colors.light}`,
          color: `${colors.light}`,
          color_active: `${colors.light}`,
          color_hover: `${colors.light}`
        },
        hoveredSpan: {
          backgroundColor: `${colors.secondary}`,
          backgroundColor_active: `${colors.infoDark}`,
          backgroundColor_hover: `${colors.infoDark}`,
          borderColor: `${colors.light}`,
          borderColor_active: `${colors.light}`,
          borderColor_hover: `${colors.light}`,
          color: `${colors.dark}`,
          color_active: `${colors.light}`,
          color_hover: `${colors.light}`
        }
      },
      sizing: {
        inputWidth: 90,
        inputWidth_small: 99,
        arrowWidth: 10
      },
      spacing: {
        ...DefaultTheme.reactDates.spacing,
        displayTextPaddingLeft_small: 10,
        displayTextPaddingRight_small: 4
      }
    }
  };

  ThemedStyleSheet.registerTheme(vzTheme);
  ThemedStyleSheet.registerInterface(aphroditeInterface);

  const {
    mapDateRange: [mapDate, setMapDate]
  } = React.useContext(StoreContext);

  // Update map date range in Context on picker selection
  useEffect(() => {
    setMapDate({ start, end });
  }, [start, end, setMapDate]);

  const handleDateChange = dates => {
    let { startDate, endDate } = dates;

    // If both null, dates have been cleared - set to default
    if (startDate === null && endDate === null) {
      startDate = dataStartDate;
      endDate = dataEndDate;
    }

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
  const isOutsideDateLimits = date =>
    date.isBefore(dataStartDate, "day") || date.isAfter(dataEndDate, "day");

  const isMobile = () => window.innerWidth < responsive.bootstrapMedium;

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
              onChange={e => {
                onYearSelect(month, e.target.value);
              }}
            >
              {yearArray.map(year => (
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
        className="fa-align-right"
        color={colors.info}
        size="2x"
        onClick={() => setFocused(null)}
      />
    </StyledCalendarInfo>
  );

  // TODO: 1. Match input picker height to bootstrap (34px)? if possible
  // TODO: 2. Fix clear x button that is warped if possible

  return (
    <DateRangePicker
      startDateId="start_date" // PropTypes.string.isRequired,
      endDateId="end_date" // PropTypes.string.isRequired,
      startDate={start} // momentPropTypes.momentObj or null,
      endDate={end} // momentPropTypes.momentObj or null,
      onDatesChange={handleDateChange} // PropTypes.func.isRequired,
      focusedInput={focused} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
      onFocusChange={focusedInput => setFocused(focusedInput)} // PropTypes.func.isRequired,
      minDate={dataStartDate}
      maxDate={dataEndDate}
      calendarInfoPosition="top"
      renderCalendarInfo={() => isMobile() && renderCalendarInfo()}
      appendToBody // Allow calendar to pop out over SideDrawer and Map components
      withFullScreenPortal={isMobile()} // Show full screen picker on mobile
      small
      renderMonthElement={renderMonthElement} // Render year picker
      showClearDates // Show X to reset dates to defaults
      orientation={isMobile() ? "vertical" : "horizontal"} // More mobile friendly than horizontal
      isOutsideRange={() => false} // Enable past dates
      isDayBlocked={isOutsideDateLimits} // Grey out dates
    />
  );
};

export default SideMapControlDateRange;
