import { useWindowSize } from "react-use";

// Use to unify Bootstrap breakpoints with media queries
export const responsive = {
  bootstrapMedium: 768,
  // Use for media queries with min-width defined to avoid style conflicts
  bootstrapMediumMin: 769,
  bootstrapExtraSmall: 576,
};

export const useIsMobile = () =>
  useWindowSize().width <= responsive.bootstrapMedium;
