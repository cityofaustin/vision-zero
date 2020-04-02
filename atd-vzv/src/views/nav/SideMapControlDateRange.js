import React, { useState, useEffect } from "react";
import { StoreContext } from "../../utils/store";
import ThemedStyleSheet from "react-with-styles/lib/ThemedStyleSheet";
import aphroditeInterface from "react-with-styles-interface-aphrodite";
import DefaultTheme from "react-dates/lib/theme/DefaultTheme";
import { DateRangePicker } from "react-dates";
import { dataStartDate, dataEndDate } from "../../constants/time";
import { colors } from "../../constants/colors";
import { responsive } from "../../constants/responsive";

export const vzTheme = {
  reactDates: {
    ...DefaultTheme.reactDates,
    zIndex: 1301,
    border: {
      ...DefaultTheme.reactDates.border,
      input: {
        ...DefaultTheme.reactDates.border.input,
        borderBottomFocused: `2px solid ${colors.infoDark}`
      }
    },
    color: {
      ...DefaultTheme.reactDates.color,
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
    }
  }
};

ThemedStyleSheet.registerTheme(vzTheme);
ThemedStyleSheet.registerInterface(aphroditeInterface);

const SideMapControlDateRange = () => {
  const [focused, setFocused] = useState(null);
  const [start, setStart] = useState(dataStartDate);
  const [end, setEnd] = useState(dataEndDate);

  const {
    mapDateRange: [mapDate, setMapDate]
  } = React.useContext(StoreContext);

  // Update map date range in Context on picker selection
  useEffect(() => {
    setMapDate({ start, end });
  }, [start, end, setMapDate]);

  const handleDateChange = dates => {
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

  const isMobile = () => window.innerWidth < responsive.bootstrapMedium;

  // Check if date is outside n year rolling window
  const isOutsideDateLimits = date =>
    date.isBefore(dataStartDate, "day") || date.isAfter(dataEndDate, "day");

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
      appendToBody // Allow calendar to pop out over SideDrawer and Map components
      withFullScreenPortal={isMobile()}
      small
      showClearDates
      orientation={isMobile() ? "vertical" : "horizontal"} // More mobile friendly than horizontal
      isOutsideRange={() => false} // Enable past dates
      isDayBlocked={isOutsideDateLimits} // Grey out dates
    />
  );
};

export default SideMapControlDateRange;
