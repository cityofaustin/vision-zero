// Detect the environment
export const isDevelopment =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development";

export const navConfig = [
  {
    title: "Summary",
    url: "/",
    category: "User",
    action: "Select Summary button",
  },
  { title: "Map", url: "/map", category: "User", action: "Select Map button" },
];
