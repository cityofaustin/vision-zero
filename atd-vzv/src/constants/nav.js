// Detect the environment
export const isDevelopment =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development";

export const navConfig = [
  {
    title: "Summary",
    url: "/",
    eventKey: "summaryNavButton",
  },
  { title: "Map", url: "/map", category: "User", eventKey: "mapNavButton" },
];
