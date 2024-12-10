import Card from "react-bootstrap/Card";
import { LocationMap } from "./LocationMap";
import { Location } from "@/types/locations";
/**
 * Card component that renders the crash map and edit controls
 */
export default function LocationMapCard({ location }: { location: Location }) {
  return (
    <Card>
      <Card.Header>Location</Card.Header>
      <Card.Body className="p-1 crash-header-card-body">
        {location.geometry && (
          <LocationMap
            polygon={location.geometry}
            locationId={location.location_id}
          />
        )}
      </Card.Body>
    </Card>
  );
}
