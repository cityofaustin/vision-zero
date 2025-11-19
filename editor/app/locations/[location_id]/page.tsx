"use client";
import { use, useMemo, useCallback } from "react";
import { notFound } from "next/navigation";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import DataCard from "@/components/DataCard";
import LocationMapCard from "@/components/LocationMapCard";
import TableWrapper from "@/components/TableWrapper";
import { useQuery } from "@/utils/graphql";
import { GET_LOCATION } from "@/queries/location";
import { Location } from "@/types/locations";
import { Filter } from "@/types/queryBuilder";
import { locationCardColumns } from "@/configs/locationDataCard";
import { locationCrashesColumns } from "@/configs/locationCrashesColumns";
import { locationCrashesQueryConfig } from "@/configs/locationCrashesTable";
import AlignedLabel from "@/components/AlignedLabel";
import { FaCircleInfo } from "react-icons/fa6";
import { locationNotesColumns } from "@/configs/notesColumns";
import NotesCard from "@/components/NotesCard";
import {
  INSERT_LOCATION_NOTE,
  UPDATE_LOCATION_NOTE,
} from "@/queries/locationNotes";
import { useDocumentTitle } from "@/utils/documentTitle";

const typename = "locations";

/**
 * Hook which returns a Filter array with the `location_id` param.
 * This can be passed as a `contextFilter` to the TableWrapper so that the
 * location's crashes table is filtered by location
 * @param {string} locationId - the location ID string from the page route
 * @returns {Filter[]} the Filter array with the single location filter
 */
const useLocationIdFilter = (locationId: string): Filter[] =>
  useMemo(
    () => [
      {
        id: "location_id",
        value: locationId,
        column: "location_id",
        operator: "_eq",
      },
    ],
    [locationId]
  );

export default function LocationDetailsPage({
  params,
}: {
  params: Promise<{ location_id: string }>;
}) {
  const { location_id: locationId } = use(params);

  const locationIdFilter = useLocationIdFilter(locationId);

  const { data, error, refetch } = useQuery<Location>({
    query: locationId ? GET_LOCATION : null,
    variables: { locationId },
    typename,
  });

  if (error) {
    console.error(error);
  }

  const onSaveCallback = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Set document title based on loaded location data
  useDocumentTitle(
    data && data.length > 0
      ? `${data[0].location_id} - ${data[0].location_name}`
      : "Vision Zero Editor",
    true // exclude the suffix
  );

  if (!data) {
    // todo: loading spinner (would be nice to use a spinner inside cards)
    return;
  }

  if (data.length === 0) {
    // 404
    notFound();
  }

  const location = data[0];

  return (
    <>
      <span className="fs-2">{location.location_name}</span>
      <Row>
        <Col sm={12} md={6} lg={7} className="mb-3">
          <LocationMapCard location={location} />
        </Col>
        <Col sm={12} md={6} lg={5} className="mb-3">
          <DataCard
            columns={locationCardColumns}
            isValidating={false}
            mutation=""
            title="Details"
            onSaveCallback={() => Promise.resolve()}
            record={location}
          />
        </Col>
      </Row>
      <Row>
        <Col className="mb-3">
          {/* map will be fixed height, list will grow vertically as needed */}
          <Card style={{ minHeight: "85vh" }}>
            <Card.Header>
              <Card.Title>Crashes</Card.Title>
              <Card.Subtitle className="fw-light text-secondary">
                <AlignedLabel>
                  <FaCircleInfo className="me-2" />
                  <span>
                    The data in this table is refreshed on an hourly basis
                  </span>
                </AlignedLabel>
              </Card.Subtitle>
            </Card.Header>
            <Card.Body className="d-flex flex-column flex-grow-1">
              <TableWrapper
                columns={locationCrashesColumns}
                initialQueryConfig={locationCrashesQueryConfig}
                localStorageKey="locationCrashesQueryConfig"
                /**
                 * Pass in location ID filter as a contextFilter so
                 * that it is not saved in the local storage config
                 */
                contextFilters={locationIdFilter}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col sm={12}>
          <NotesCard
            notes={location.location_notes || []}
            notesColumns={locationNotesColumns}
            updateMutation={UPDATE_LOCATION_NOTE}
            insertMutation={INSERT_LOCATION_NOTE}
            onSaveCallback={onSaveCallback}
            recordId={location.location_id}
            refetch={onSaveCallback}
          />
        </Col>
      </Row>
    </>
  );
}
