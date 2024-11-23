"use client";
import { useCallback } from "react";
import { notFound } from "next/navigation";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import CrashMapCard from "@/components/CrashMapCard";
import { GET_LOCATION } from "@/queries/location";
import { UPDATE_CRASH } from "@/queries/crash";
import { useQuery } from "@/utils/graphql";
import AppBreadCrumb from "@/components/AppBreadCrumb";
import CrashHeader from "@/components/CrashHeader";
import CrashDiagramCard from "@/components/CrashDiagramCard";
import DataCard from "@/components/DataCard";
import RelatedRecordTable from "@/components/RelatedRecordTable";
import ChangeLog from "@/components/ChangeLog";
import { crashDataCards } from "@/configs/crashDataCard";
import { unitRelatedRecordCols } from "@/configs/unitRelatedRecordTable";
import { locationSchema } from "@/schema/locationSchema";
import { Crash } from "@/types/crashes";

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

  const onSaveCallback = useCallback(async () => {
    await refetch();
  }, [refetch]);

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
        <Col sm={12} md={6} lg={4} className="mb-3">
          <CrashMapCard
            savedLatitude={location.latitude}
            savedLongitude={location.longitude}
            // todo: this is fake just to make a map render
            crashId={1}
            onSaveCallback={onSaveCallback}
            mutation={UPDATE_CRASH}
          />
        </Col>
      </Row>
    </>
  );
}
