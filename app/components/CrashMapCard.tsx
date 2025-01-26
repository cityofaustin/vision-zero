import { useState } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { CrashMap } from "@/components/CrashMap";
import { useMutation } from "@/utils/graphql";
import { LatLon } from "@/components/CrashMap";

interface CrashMapCardProps {
  savedLatitude: number | null;
  savedLongitude: number | null;
  crashId: number;
  onSaveCallback: () => Promise<void>;
  mutation: string;
}

/**
 * Card component that renders the crash map and edit controls
 */
export default function CrashMapCard({
  crashId,
  savedLatitude,
  savedLongitude,
  onSaveCallback,
  mutation,
}: CrashMapCardProps) {
  const [isEditingCoordinates, setIsEditingCoordinates] = useState(false);
  const [editCoordinates, setEditCoordinates] = useState<LatLon>({
    latitude: 0,
    longitude: 0,
  });
  const { mutate, loading: isMutating } = useMutation(mutation);

  return (
    <Card className="h-100">
      <Card.Header> <Card.Title>Location</Card.Title></Card.Header>
      <Card.Body className="p-1 crash-header-card-body">
        <CrashMap
          savedLatitude={savedLatitude}
          savedLongitude={savedLongitude}
          isEditing={isEditingCoordinates}
          editCoordinates={editCoordinates}
          setEditCoordinates={setEditCoordinates}
        />
      </Card.Body>
      <Card.Footer>
        <div className="d-flex justify-content-between">
          <div>
            <span>Geocode provider</span>
          </div>
          <div>
            <Button
              size="sm"
              variant="primary"
              disabled={isMutating}
              onClick={async () => {
                if (!isEditingCoordinates) {
                  setIsEditingCoordinates(true);
                } else {
                  await mutate({
                    id: crashId,
                    updates: { ...editCoordinates },
                  });
                  await onSaveCallback();
                  setIsEditingCoordinates(false);
                }
              }}
            >
              {isEditingCoordinates ? "Save" : "Edit"}
            </Button>
            {isEditingCoordinates && (
              <Button
                className="ms-1"
                size="sm"
                variant="danger"
                onClick={() => setIsEditingCoordinates(false)}
                disabled={isMutating}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </Card.Footer>
    </Card>
  );
}
