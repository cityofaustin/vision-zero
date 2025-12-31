import { useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useMutation } from "@/utils/graphql";
import { INSERT_USER_EVENT } from "@/queries/userEvents";

/**
 * Custom hook that provides a function to log user activity events.
 *
 * @returns A function that logs an event with the given name. The function
 * is safe to call even when the user is not authenticated - it will simply
 * do nothing in that case.
 *
 * @example
 * ```tsx
 * const logUserEvent = useLogUserEvent();
 *
 * // Log an event
 * logUserEvent("crashes_list_filters_toggle");
 * ```
 */
export function useLogUserEvent() {
  const { user, isAuthenticated } = useAuth0();
  const { mutate: insertUserEvent } = useMutation(INSERT_USER_EVENT);

  const logUserEvent = useCallback(
    (eventName: string) => {
      if (!eventName || !isAuthenticated || !user?.email) {
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
    },
    [insertUserEvent, isAuthenticated, user?.email]
  );

  return logUserEvent;
}

