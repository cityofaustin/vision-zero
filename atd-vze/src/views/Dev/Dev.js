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
