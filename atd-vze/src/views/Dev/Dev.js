import React from "react";
import { Link } from "react-router-dom";

const pages = [
  {
    name: "Dashboard",
    url: "/dev/dashboard",
    icon: "icon-speedometer",
  },
  {
    name: "Colors",
    url: "/dev/theme/colors",
    icon: "icon-drop",
  },
  {
    name: "Typography",
    url: "/dev/theme/typography",
    icon: "icon-pencil",
  },
  {
    name: "Base",
    url: "/dev/base",
    icon: "icon-puzzle",
    children: [
      {
        name: "Breadcrumbs",
        url: "/dev/base/breadcrumbs",
        icon: "icon-puzzle",
      },
      {
        name: "Cards",
        url: "/dev/base/cards",
        icon: "icon-puzzle",
      },
      {
        name: "Carousels",
        url: "/dev/base/carousels",
        icon: "icon-puzzle",
      },
      {
        name: "Collapses",
        url: "/dev/base/collapses",
        icon: "icon-puzzle",
      },
      {
        name: "Dropdowns",
        url: "/dev/base/dropdowns",
        icon: "icon-puzzle",
      },
      {
        name: "Forms",
        url: "/dev/base/forms",
        icon: "icon-puzzle",
      },
      {
        name: "Jumbotrons",
        url: "/dev/base/jumbotrons",
        icon: "icon-puzzle",
      },
      {
        name: "List groups",
        url: "/dev/base/list-groups",
        icon: "icon-puzzle",
      },
      {
        name: "Navs",
        url: "/dev/base/navs",
        icon: "icon-puzzle",
      },
      {
        name: "Paginations",
        url: "/dev/base/paginations",
        icon: "icon-puzzle",
      },
      {
        name: "Popovers",
        url: "/dev/base/popovers",
        icon: "icon-puzzle",
      },
      {
        name: "Progress Bar",
        url: "/dev/base/progress-bar",
        icon: "icon-puzzle",
      },
      {
        name: "Switches",
        url: "/dev/base/switches",
        icon: "icon-puzzle",
      },
      {
        name: "Tables",
        url: "/dev/base/tables",
        icon: "icon-puzzle",
      },
      {
        name: "Tabs",
        url: "/dev/base/tabs",
        icon: "icon-puzzle",
      },
      {
        name: "Tooltips",
        url: "/dev/base/tooltips",
        icon: "icon-puzzle",
      },
    ],
  },
  {
    name: "Buttons",
    url: "/dev/buttons",
    icon: "icon-cursor",
    children: [
      {
        name: "Buttons",
        url: "/dev/buttons/buttons",
        icon: "icon-cursor",
      },
      {
        name: "Button dropdowns",
        url: "/dev/buttons/button-dropdowns",
        icon: "icon-cursor",
      },
      {
        name: "Button groups",
        url: "/dev/buttons/button-groups",
        icon: "icon-cursor",
      },
      {
        name: "Brand Buttons",
        url: "/dev/buttons/brand-buttons",
        icon: "icon-cursor",
      },
    ],
  },
  {
    name: "Charts",
    url: "/dev/charts",
    icon: "icon-pie-chart",
  },
  {
    name: "Icons",
    url: "/dev/icons",
    icon: "icon-star",
    children: [
      {
        name: "CoreUI Icons",
        url: "/dev/icons/coreui-icons",
        icon: "icon-star",
        badge: {
          variant: "info",
          text: "NEW",
        },
      },
      {
        name: "Flags",
        url: "/dev/icons/flags",
        icon: "icon-star",
      },
      {
        name: "Font Awesome",
        url: "/dev/icons/font-awesome",
        icon: "icon-star",
        badge: {
          variant: "secondary",
          text: "4.7",
        },
      },
      {
        name: "Simple Line Icons",
        url: "/dev/icons/simple-line-icons",
        icon: "icon-star",
      },
    ],
  },
  {
    name: "Notifications",
    url: "/dev/notifications",
    icon: "icon-bell",
    children: [
      {
        name: "Alerts",
        url: "/dev/notifications/alerts",
        icon: "icon-bell",
      },
      {
        name: "Badges",
        url: "/dev/notifications/badges",
        icon: "icon-bell",
      },
      {
        name: "Modals",
        url: "/dev/notifications/modals",
        icon: "icon-bell",
      },
    ],
  },
];

const Dev = () => (
  <ul>
    {pages.map(section => (
      <li>
        {/* If there are children show the item and the nested list */}
        {!!section.children ? (
          <>
            <Link to={section.url}>{section.name}</Link>
            <ul>
              {section.children.map(page => (
                <li>
                  <Link to={page.url}>{page.name}</Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          // Else just the one item
          <Link to={section.url}>{section.name}</Link>
        )}
      </li>
    ))}
  </ul>
);

export default Dev;
