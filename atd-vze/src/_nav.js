export default {
  items: [
    {
      title: true,
      name: "Data",
      wrapper: {
        // optional wrapper object
        element: "", // required valid HTML5 element tag
        attributes: {}, // optional valid JS object with JS API naming ex: { className: "my-class", style: { fontFamily: "Verdana" }, id: "my-id"}
      },
      class: "", // optional class names space delimited list for title item ex: "text-center"
    },
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: "icon-speedometer",
    },
    {
      name: "Crashes",
      url: "/crashes",
      icon: "icon-shield",
    },
    {
      name: "Locations",
      url: "/locations",
      icon: "icon-map",
    },
    {
      divider: true,
    },
  ],
};
