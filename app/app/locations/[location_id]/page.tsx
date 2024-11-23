"use client";
import { notFound } from "next/navigation";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import AppBreadCrumb from "@/components/AppBreadCrumb";
import DataCard from "@/components/DataCard";
import LocationMapCard from "@/components/LocationMapCard";
import { useQuery } from "@/utils/graphql";
import { GET_LOCATION } from "@/queries/location";
import { locationSchema } from "@/schema/locationSchema";
import { locationColumns } from "@/configs/locationColumns";

const typename = "atd_txdot_locations";

export default function LocationDetailsPage({
  params,
}: {
  params: { location_id: string };
}) {
  const locationId = params.location_id;

  const { data, error, refetch, isValidating } = useQuery({
    query: locationId ? GET_LOCATION : null,
    variables: { locationId },
    schema: locationSchema,
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
        <Col sm={12} md={8} className="mb-3">
          <LocationMapCard location={location} />
        </Col>
        <Col sm={12} md={4} className="mb-3">
          <DataCard
            columns={locationColumns}
            isValidating={false}
            mutation=""
            title="Details"
            onSaveCallback={() => Promise.resolve()}
            record={location}
          />
        </Col>
      </Row>
    </>
  );
}
