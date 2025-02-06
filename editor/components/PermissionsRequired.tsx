import { ReactNode } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { hasRole } from "@/utils/auth";

interface PermissionsRequiredProps {
  children: ReactNode;
  allowedRoles?: string[];
}

/**
 * Component wrapper that renders `null` if the user does not have one of the
 * allowed roles. If the allowedRoles array is undefined then the permission
 * check is skipped
 */
export default function PermissionsRequired({
  children,
  allowedRoles,
}: PermissionsRequiredProps) {
  const { user } = useAuth0();
  if (!allowedRoles || (user && hasRole(allowedRoles, user))) {
    return children;
  }
  return null;
}
