import { ReactNode, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useMutation } from "@/utils/graphql";
import { INSERT_USER_EVENT } from "@/queries/userEvents";

interface ActivityMetricsProps {
  /**
   * The name of the event to log
   */
  eventName: string;
  /**
   * Child components to render
   */
  children: ReactNode;
}

/**
 * This wrapper logs user activity events to the database. It calls the
 * INSERT_USER_EVENT mutation once each time this component mounts.
 *
 * The event is logged with the user's email address from Auth0.
 *
 * @example
 * ```tsx
 * <ActivityMetrics eventName="crashes_list">
 *   <CrashesList />
 * </ActivityMetrics>
 * ```
 */
export default function ActivityMetrics({
  eventName,
  children,
}: ActivityMetricsProps) {
  const { user, isAuthenticated } = useAuth0();
  const { mutate: insertUserEvent } = useMutation(INSERT_USER_EVENT);

  useEffect(() => {
    if (!isAuthenticated || !user?.email) {
      return;
    }

    insertUserEvent({
      event_name: eventName,
      user_email: user.email,
    }).catch((error) => {
      console.error(
        `Failed to log the '${eventName}' event for user ${user.email}.`,
        error
      );
    });
  }, [insertUserEvent, isAuthenticated, user?.email, eventName]);

  return <>{children}</>;
}


