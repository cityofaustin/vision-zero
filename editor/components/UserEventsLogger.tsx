import { ReactNode, useEffect, useRef } from "react";
import { useLogUserEvent } from "@/utils/userEvents";

interface UserEventsLoggerProps {
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
 * <UserEventsLogger eventName="crashes_list_view">
 *   <CrashesList />
 * </UserEventsLogger>
 * ```
 */
export default function UserEventsLogger({
  eventName,
  children,
}: UserEventsLoggerProps) {
  const logUserEvent = useLogUserEvent();
  const hasLoggedEvent = useRef(false);

  useEffect(() => {
    if (!hasLoggedEvent.current) {
      hasLoggedEvent.current = true;
      logUserEvent(eventName);
    }
  }, [logUserEvent, eventName]);

  return <>{children}</>;
}
