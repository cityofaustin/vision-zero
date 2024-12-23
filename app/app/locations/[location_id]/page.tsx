"use client";
import { useMemo } from "react";
import { notFound } from "next/navigation";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import AppBreadCrumb from "@/components/AppBreadCrumb";
import DataCard from "@/components/DataCard";
import LocationMapCard from "@/components/LocationMapCard";
import TableWrapper from "@/components/TableWrapper";
import { useQuery } from "@/utils/graphql";
import { GET_LOCATION } from "@/queries/location";
import { Location } from "@/types/locations";
import { Filter } from "@/utils/queryBuilder";
import { locationCardColumns } from "@/configs/locationDataCard";
import { locationCrashesColumns } from "@/configs/locationCrashesColumns";
import { locationCrashesQueryConfig } from "@/configs/locationCrashesTable";

const typename = "atd_txdot_locations";

/**
 * Hook which returns builds a queryBuilder Filter array with the
 * `location_id` param - this can be passed as a `contextFilter`
 * to the TableWrapper so that locationCrashesList is filtered
 * by location
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
  params: { location_id: string };
}) {
  const locationId = params.location_id;

  const locationIdFilter = useLocationIdFilter(locationId);
  const { data, error } = useQuery<Location>({
    query: locationId ? GET_LOCATION : null,
    variables: { locationId },
    typename,
  });

  if (error) {
    console.error(error);
  }

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
      <AppBreadCrumb />
      <span className="fs-2">{location.description}</span>
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
        <Col>
          <Card>
            <Card.Header>Crashes</Card.Header>
            <Card.Body>
              <TableWrapper
                columns={locationCrashesColumns}
                initialQueryConfig={locationCrashesQueryConfig}
                localStorageKey="locationCrashesQueryConfig"
                contextFilters={locationIdFilter}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}
