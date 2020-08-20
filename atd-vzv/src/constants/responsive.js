import { useWindowSize } from "react-use";

// Use to unify Bootstrap breakpoints with media queries
export const responsive = {
  bootstrapLarge: 990,
  bootstrapMedium: 768,
  // Use for media queries with min-width defined to avoid style conflicts
  bootstrapMediumMin: 769,
  bootstrapExtraSmall: 576,
  headerHeight: 90,
  headerHeightMobile: 70,
  headerButtonHeight: 50,
  headerButtonWidth: 200,
  headerLogoOffset: 34,
  drawerWidth: 300,
  datePickerTwoMonthsHeight: 700, // Height for two months to fit in mobile datepicker view
  infoPopoverFullWidth: 500,
};

export const useIsTablet = () =>
  useWindowSize().width <= responsive.bootstrapMedium;

export const useIsMobile = () =>
  useWindowSize().width <= responsive.bootstrapExtraSmall;

export const useCanTwoMonthsFit = () =>
  useWindowSize().height >= responsive.datePickerTwoMonthsHeight;
