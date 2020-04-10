// Use to unify Bootstrap breakpoints with media queries
export const responsive = {
  bootstrapMedium: 768,
  // Use for media queries with min-width defined to avoid style conflicts
  bootstrapMediumMin: 769,
  bootstrapExtraSmall: 576,
};

export const isMobile = () => window.innerWidth < responsive.bootstrapMedium;
