import { CustomUser, hasRole } from "@/utils/auth";

/** Roles that have editor or administrator permisisons */
export const ADMIN_EDIT_ROLES = ["editor", "vz-admin"];

/** Roles that may view EMS patient care records */
export const EMS_VIEW_ROLES = [...ADMIN_EDIT_ROLES];
