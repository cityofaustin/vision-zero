import {
  FaShieldHeart,
  FaGaugeHigh,
  FaLocationDot,
  FaUserGroup,
  FaCloudArrowUp,
} from "react-icons/fa6";
import { IconType } from "react-icons";

type Route = {
  path: string;
  label: string;
  icon: IconType;
  allowedRoles?: string[];
};

export const routes: Route[] = [
  {
    path: "dashboard",
    label: "Dashboard",
    icon: FaGaugeHigh,
  },
  {
    path: "crashes",
    label: "Crashes",
    icon: FaShieldHeart,
  },
  {
    path: "locations",
    label: "Locations",
    icon: FaLocationDot,
  },
  {
    path: "upload-non-cr3",
    label: "Upload Non-CR3",
    icon: FaCloudArrowUp,
    allowedRoles: ["editor", "vz-admin"],
  },
  {
    path: "users",
    label: "Users",
    icon: FaUserGroup,
  },
];
