import React, { useState, useEffect } from "react";
import { StoreContext } from "src/constants/context";
import ThemedStyleSheet from "react-with-styles/lib/ThemedStyleSheet";
import aphroditeInterface from "react-with-styles-interface-aphrodite";
import DefaultTheme from "react-dates/lib/theme/DefaultTheme";
import styled from "styled-components";
import { mapStartDate, mapEndDate } from "../../constants/time";
import { colors } from "../../constants/colors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRedoAlt } from "@fortawesome/free-solid-svg-icons";

const SideMapControlDateRange = ({ type }) => {
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

  // Create styled date input
  const StyledDateInput = styled.input.attrs({ type: "date" })`
    font-weight: 200;
    color: rgb(72, 72, 72);
    border: 0px;
    width: 100px
    font-size: 15px
  `;

  const StyledButtonContainer = styled.div`
    /* Mock a Bootstrap outline button */
    border: 1px solid ${colors.dark};
    height: 34px;
    border-radius: 4px;
    padding-left: 2px;
    display: flex
    justify-content: space-between
    align-items: center;
    color: ${colors.dark};

    /* Center start and end date inputs */
    [id^="map-start-date-"],
    [id^="map-end-date-"] {
      text-align: center;
    }
  `;

  // Center and size calendar icon or button
  const calendarInputIconStyles = `position: relative;
    top: 2px;
    width: 16px;
    height: 16px;`;

  const StyledRedoButton = styled(FontAwesomeIcon)`
    ${calendarInputIconStyles}
    right: 1px;
    cursor: pointer;
  `;

  return (
    <StyledButtonContainer className="pe-0 picker-outline">
      {/** address that is closes when clicking */}
      <StyledDateInput
        type="date"
        id={`map-start-date-${type}`}
        name="map-start"
        value={start ?? mapStartDate}
        min={mapStartDate}
        max={mapEndDate}
        onChange={(e) => handleStartDateChange(e.target.value)}
      />
      {"-"}
      <StyledDateInput
        type="date"
        id={`map-end-date-${type}`}
        name="map-end"
        value={end ?? mapEndDate}
        min={mapStartDate}
        max={mapEndDate}
        onChange={(e) => handleEndDateChange(e.target.value)}
      />
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
      )}
    </StyledButtonContainer>
  );
};

export default SideMapControlDateRange;
