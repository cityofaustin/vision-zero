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
      url: "#",
      icon: "icon-shield",
      children: [
        {
          name: "Crashes",
          url: "/crashes",
          icon: "icon-puzzle",
        },
        {
          name: "Q/A Deaths & Injuries",
          url: "/crashes/qa",
          icon: "icon-puzzle",
        },
      ],
    },
    {
      name: "Locations",
      url: "#",
      icon: "icon-location-pin",
      children: [
        {
          name: "All locations",
          url: "/locations",
          icon: "icon-map",
        },
        {
          name: "Locations Q/A",
          url: "/locations/qa",
          icon: "icon-compass",
        },
      ],
    },
    {
      divider: true,
    },
  ],
};
