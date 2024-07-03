import React from "react";
import { isAdmin, isItSupervisor } from "./auth/authContext";

const Dashboard = React.lazy(() => import("./views/Dashboard"));
const VZDashboard = React.lazy(() => import("./views/VZDashboard"));

const Alerts = React.lazy(() => import("./views/Notifications/Alerts"));
const Badges = React.lazy(() => import("./views/Notifications/Badges"));
const Modals = React.lazy(() => import("./views/Notifications/Modals"));
const Colors = React.lazy(() => import("./views/Theme/Colors"));
const Typography = React.lazy(() => import("./views/Theme/Typography"));
const Widgets = React.lazy(() => import("./views/Widgets/Widgets"));
const Dev = React.lazy(() => import("./views/Dev/Dev"));
const Crashes = React.lazy(() => import("./views/Crashes/Crashes"));
const CrashesChanges = React.lazy(() =>
  import("./views/Crashes/CrashesChanges")
);
const CrashChange = React.lazy(() => import("./views/Crashes/CrashChange"));
const Crash = React.lazy(() => import("./views/Crashes/Crash"));
const Profile = React.lazy(() => import("./views/Profile/Profile"));
const Locations = React.lazy(() => import("./views/Locations/Locations"));
const Location = React.lazy(() => import("./views/Locations/Location"));
const Fatalities = React.lazy(() => import("./views/Fatalities/Fatalities"));
const Users = React.lazy(() => import("./views/Users/Users"));
const User = React.lazy(() => import("./views/Users/User"));
const AddUser = React.lazy(() => import("./views/Users/AddUser"));
const EditUser = React.lazy(() => import("./views/Users/EditUser"));
const ReportsInconsistentKSI = React.lazy(() =>
  import("./views/Reports/ReportsInconsistentKSI")
);
const ToolsUploadNonCR3 = React.lazy(() =>
  import("./views/Tools/ToolsUploadNonCR3")
);
const CreateCrashRecord = React.lazy(() =>
  import("./views/Tools/CreateCrashRecord")
);
// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
// Accept roles arg for role-based access to routes
const routes = roles => [
  { path: "/", exact: true, name: "Home" },
  { path: "/dev/dashboard", name: "Dashboard", component: Dashboard },
  { path: "/dev/theme", exact: true, name: "Theme", component: Colors },
  { path: "/dev/theme/colors", name: "Colors", component: Colors },
  { path: "/dev/theme/typography", name: "Typography", component: Typography },
  {
    path: "/dev/notifications",
    exact: true,
    name: "Notifications",
    component: Alerts,
  },
  { path: "/dev/notifications/alerts", name: "Alerts", component: Alerts },
  { path: "/dev/notifications/badges", name: "Badges", component: Badges },
  { path: "/dev/notifications/modals", name: "Modals", component: Modals },
  { path: "/dev/widgets", name: "Widgets", component: Widgets },
  { path: "/profile", name: "Profile", component: Profile },
  {
    path: "/dashboard",
    exact: true,
    name: "Dashboard",
    component: VZDashboard,
  },
  { path: "/locations", exact: true, name: "Locations", component: Locations },
  {
    path: "/locations/:id",
    exact: true,
    name: "Location Details",
    component: Location,
  },
  { path: "/crashes", exact: true, name: "Crashes", component: Crashes },
  {
    path: "/crashes/:id",
    exact: true,
    name: "Crash Details",
    component: Crash,
  },
  (isAdmin(roles) || isItSupervisor(roles)) && {
    path: "/fatalities",
    exact: true,
    name: "Fatalities",
    component: Fatalities,
  },
  {
    path: "/dev",
    exact: true,
    name: "Demo UI Components",
    component: Dev,
  },
  (isAdmin(roles) || isItSupervisor(roles)) && {
    path: "/changes",
    exact: true,
    name: "Crash Changes",
    component: CrashesChanges,
  },
  (isAdmin(roles) || isItSupervisor(roles)) && {
    path: "/changes/:id",
    exact: true,
    name: "Crash Change",
    component: CrashChange,
  },
  (isAdmin(roles) || isItSupervisor(roles)) && {
    path: "/reports/inconsistent_ksi_counts",
    exact: true,
    name: "Crashes with Inconsistent KSI Counts",
    component: ReportsInconsistentKSI,
  },
  (isAdmin(roles) || isItSupervisor(roles)) && {
    path: "/tools/upload_non_cr3",
    exact: true,
    name: "Upload Non-CR3 Crashes",
    component: ToolsUploadNonCR3,
  },
  (isAdmin(roles) || isItSupervisor(roles)) && {
    path: "/tools/create_crash_record",
    exact: true,
    name: "Create Crash Record",
    component: CreateCrashRecord,
  },
  (isAdmin(roles) || isItSupervisor(roles)) && {
    path: "/users",
    exact: true,
    name: "Users",
    component: Users,
  },
  (isAdmin(roles) || isItSupervisor(roles)) && {
    path: "/users/add",
    exact: true,
    name: "Add User",
    component: AddUser,
  },
  (isAdmin(roles) || isItSupervisor(roles)) && {
    path: "/users/:id/edit",
    exact: true,
    name: "Edit User",
    component: EditUser,
  },
  (isAdmin(roles) || isItSupervisor(roles)) && {
    path: "/users/:id",
    exact: true,
    name: "User Details",
    component: User,
  },
];

export default routes;
