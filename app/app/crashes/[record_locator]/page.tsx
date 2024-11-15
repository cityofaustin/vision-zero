"use client";
import { useCallback } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import CrashMapCard from "@/components/CrashMapCard";
import { GET_CRASH, UPDATE_CRASH } from "@/queries/crash";
import { UPDATE_UNIT } from "@/queries/unit";
import { useQuery } from "@/utils/graphql";
import AppBreadCrumb from "@/components/AppBreadCrumb";
import CrashHeader from "@/components/CrashHeader";
import CrashDiagramCard from "@/components/CrashDiagramCard";
import DataCard from "@/components/DataCard";
import RelatedRecordTable from "@/components/RelatedRecordTable";
import ChangeLog from "@/components/ChangeLog";
import { crashDataCards } from "@/configs/crashDataCard";
import { unitRelatedRecordCols } from "@/configs/unitRelatedRecordTable";
import { Crash } from "@/types/types";

export default function CrashDetailsPage({
  params,
}: {
  params: { record_locator: string };
}) {
  const recordLocator = params.record_locator;

  const { data, refetch, isValidating } = useQuery<{
    crashes: Crash[];
  }>({
    // todo: is the router ever not ready - ie do we need this ternary?
    query: recordLocator ? GET_CRASH : null,
    variables: { recordLocator },
  });

  const onSaveCallback = useCallback(async () => {
    await refetch();
  }, [refetch]);

  if (!data || !data?.crashes?.[0]) {
    // todo: 404 page
    // todo: loading spinner (would be nice to use a spinner inside cards)
    return;
  }

  const crash = data.crashes[0];

  return (
    <>
      <AppBreadCrumb />
      <CrashHeader crash={crash} />
      <Row>
        <Col sm={12} md={6} lg={4} className="mb-3">
          <CrashMapCard
            savedLatitude={crash.latitude}
            savedLongitude={crash.longitude}
            crashId={crash.id}
            onSaveCallback={onSaveCallback}
            mutation={UPDATE_CRASH}
          />
        </Col>
        <Col sm={12} md={6} lg={4} className="mb-3">
          <CrashDiagramCard crash={crash} />
        </Col>
        <Col sm={12} md={6} lg={4} className="mb-3">
          <Card>
            <Card.Header>Narrative</Card.Header>
            <Card.Body className="crash-header-card-body">
              <Card.Text>{crash.investigator_narrative || ""}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col sm={12} md={6} lg={4} className="mb-3">
          <DataCard<Crash>
            record={crash}
            isValidating={isValidating}
            title="Summary"
            columns={crashDataCards.summary}
            mutation={UPDATE_CRASH}
            onSaveCallback={onSaveCallback}
          />
        </Col>
        <Col sm={12} md={6} lg={4} className="mb-3">
          <DataCard<Crash>
            record={crash}
            isValidating={isValidating}
            title="Flags"
            columns={crashDataCards.flags}
            mutation={UPDATE_CRASH}
            onSaveCallback={onSaveCallback}
          />
        </Col>
        <Col sm={12} md={6} lg={4} className="mb-3">
          <DataCard<Crash>
            record={crash}
            isValidating={isValidating}
            title="Other"
            columns={crashDataCards.other}
            mutation={UPDATE_CRASH}
            onSaveCallback={onSaveCallback}
          />
        </Col>
      </Row>
      <Row>
        <Col sm={12} md={6} lg={4} className="mb-3">
          <DataCard<Crash>
            record={crash}
            isValidating={isValidating}
            title="Primary address"
            columns={crashDataCards.address}
            mutation={UPDATE_CRASH}
            onSaveCallback={onSaveCallback}
          />
        </Col>
        <Col sm={12} md={6} lg={4} className="mb-3">
          <DataCard<Crash>
            record={crash}
            isValidating={isValidating}
            title="Secondary address"
            columns={crashDataCards.address_secondary}
            mutation={UPDATE_CRASH}
            onSaveCallback={onSaveCallback}
          />
        </Col>
      </Row>
      <Row>
        <Col sm={12} className="mb-3">
          <RelatedRecordTable
            records={crash.units}
            isValidating={isValidating}
            title="Units"
            columns={unitRelatedRecordCols}
            mutation={UPDATE_UNIT}
            onSaveCallback={onSaveCallback}
          />
        </Col>
      </Row>
      <Row className="mb-5">
        <Col>{crash && <ChangeLog logs={crash.change_logs} />}</Col>
      </Row>
    </>
  );
}
