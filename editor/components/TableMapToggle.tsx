import { Dispatch, SetStateAction } from "react";
import Button from "react-bootstrap/Button";
import { useAuth0 } from "@auth0/auth0-react";
import { FaMapPin, FaTableCells } from "react-icons/fa6";
import AlignedLabel from "./AlignedLabel";
import { QueryConfig } from "@/types/queryBuilder";
import { ButtonGroup } from "react-bootstrap";
import { produce } from "immer";
import { useMutation } from "@/utils/graphql";
import { INSERT_USER_EVENT } from "@/queries/userEvents";

export interface TableMapToggleProps {
  queryConfig: QueryConfig;
  setQueryConfig: Dispatch<SetStateAction<QueryConfig>>;
  /**
   * Optional event name to log when map view is activated
   */
  eventName?: string;
}

/**
 * Table component that controls advanced search filters
 */
export default function TableMapToggle({
  queryConfig,
  setQueryConfig,
  eventName,
}: TableMapToggleProps) {
  const { user, isAuthenticated } = useAuth0();
  const { mutate: insertUserEvent } = useMutation(INSERT_USER_EVENT);

  const handleMapClick = () => {
    if (queryConfig.mapConfig?.isActive) {
      // nothing todo
      return;
    }

    // Log the event when map is activated
    if (eventName && isAuthenticated && user?.email) {
      insertUserEvent({
        event_name: eventName,
        user_email: user.email,
      }).catch((error) => {
        console.error(
          `Failed to log the '${eventName}' event for user ${user.email}.`,
          error
        );
      });
    }

    const newQueryConfig = produce(queryConfig, (newQueryConfig) => {
      if (newQueryConfig.mapConfig) {
        newQueryConfig.mapConfig.isActive = true;
      }
      return newQueryConfig;
    });
    setQueryConfig(newQueryConfig);
  };

  return (
    <ButtonGroup>
      {/* list toggle */}
      <Button
        variant={
          !queryConfig.mapConfig?.isActive ? "primary" : "outline-primary"
        }
        onClick={() => {
          if (!queryConfig.mapConfig?.isActive || !queryConfig.mapConfig) {
            // nothing todo
            return;
          }
          const newQueryConfig = produce(queryConfig, (newQueryConfig) => {
            if (newQueryConfig.mapConfig) {
              newQueryConfig.mapConfig.isActive = false;
            }
            return newQueryConfig;
          });
          setQueryConfig(newQueryConfig);
        }}
      >
        <AlignedLabel>
          <FaTableCells />
          <span className="mx-2">List</span>
        </AlignedLabel>
      </Button>
      {/* map toggle */}
      <Button
        variant={
          queryConfig.mapConfig?.isActive ? "primary" : "outline-primary"
        }
        onClick={handleMapClick}
      >
        <AlignedLabel>
          <FaMapPin />
          <span className="mx-2">Map</span>
        </AlignedLabel>
      </Button>
    </ButtonGroup>
  );
}
