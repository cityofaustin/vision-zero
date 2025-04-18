"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import DataCard from "@/components/DataCard";
import { emsDataCards } from "@/configs/emsDataCards";
import { useMutation, useQuery } from "@/utils/graphql";
import {
  GET_EMS_RECORDS,
  GET_MATCHING_PEOPLE,
  UPDATE_EMS_INCIDENT,
  UPDATE_EMS_INCIDENT_CRASH_AND_PERSON,
} from "@/queries/ems";
import { EMSPatientCareRecord } from "@/types/ems";
import RelatedRecordTable from "@/components/RelatedRecordTable";
import EMSLinkRecordButton, {
  EMSLinkRecordButtonProps,
} from "@/components/EMSLinkRecordButton";
import EMSLinkToPersonButton, {
  EMSLinkToPersonButtonProps,
} from "@/components/EMSLinkToPersonButton";
import { emsMatchingPeopleColumns } from "@/configs/emsMatchingPeopleColumns";
import { PeopleListRow } from "@/types/peopleList";
import { FaTruckMedical } from "react-icons/fa6";

export default function EMSDetailsPage({
  params,
}: {
  params: { incident_number: string };
}) {
  const [selectedEmsPcr, setSelectedEmsPcr] =
    useState<EMSPatientCareRecord | null>(null);

  const incident_number = params.incident_number;

  /**
   * Get all EMS records associated with this incident
   */
  const {
    data: ems_pcrs,
    error,
    isValidating,
    refetch,
  } = useQuery<EMSPatientCareRecord>({
    query: incident_number ? GET_EMS_RECORDS : null,
    variables: {
      incident_number: incident_number,
    },
    typename: "ems__incidents",
  });

  const { mutate: updateEMSIncident } = useMutation(
    UPDATE_EMS_INCIDENT_CRASH_AND_PERSON
  );

  /**
   * Hook which manages which related crash PKs we should
   * use to query people records
   */
  const relatedCrashPks: number[] | null = useMemo(() => {
    if (!ems_pcrs) {
      return null;
    }
    const relatedCrashPks: number[] = [];
    ems_pcrs.forEach((ems) => {
      if (ems.crash_pk) {
        // if we have a crash_pk populated, use it
        relatedCrashPks.push(ems.crash_pk);
      } else if (ems.matched_crash_pks) {
        // otherwise use any matched crash_pks
        relatedCrashPks.push(...ems.matched_crash_pks);
      }
    });
    // dedupe array with Set constructors
    return Array.from(new Set(relatedCrashPks));
  }, [ems_pcrs]);

  /**
   * Get all people records linked to crashes associated with these incidents
   */
  const { data: matchingPeople } = useQuery<PeopleListRow>({
    query: relatedCrashPks ? GET_MATCHING_PEOPLE : null,
    variables: {
      crash_pks: relatedCrashPks,
    },
    typename: "people_list_view",
  });

  const onSaveCallback = useCallback(async () => {
    await refetch();
  }, [refetch]);

  /**
   * Memoize the additional components props for related record tables
   */
  const linkRecordButtonProps: EMSLinkRecordButtonProps = useMemo(
    () => ({
      onClick: (emsPcr) => {
        setSelectedEmsPcr((prevEmsPcr) => {
          return prevEmsPcr?.id === emsPcr?.id ? null : emsPcr;
        });
      },
      selectedEmsPcr: selectedEmsPcr,
    }),
    [selectedEmsPcr]
  );

  const linkToPersonButtonProps: EMSLinkToPersonButtonProps = useMemo(
    () => ({
      onClick: (emsId, personId, crashPk) => {
        updateEMSIncident({
          id: emsId,
          person_id: personId,
          crash_pk: crashPk,
        })
          .then(() => refetch())
          .then(() => {
            setSelectedEmsPcr(null);
          });
      },
      selectedEmsPcr: selectedEmsPcr,
    }),
    [updateEMSIncident, selectedEmsPcr, refetch]
  );

  if (error) {
    console.error(error);
  }

  /**
   * Use the first EMS record as the "incident"
   */
  const incident = ems_pcrs?.[0];

  /**
   * Set the title of the page inside the HTML head element
   */
  useEffect(() => {
    if (incident) {
      document.title = `EMS ${incident.incident_number} - ${incident.incident_location_address}`;
    }
  }, [incident]);

  if (!ems_pcrs) {
    return;
  }

  if (!incident) {
    notFound();
  }

  return (
    <>
      <Row>
        <Col className="d-flex fs-3 align-items-center mb-3">
          <FaTruckMedical className="me-2" />
          <span>{incident.incident_location_address}</span>
        </Col>
      </Row>
      <Row>
        <Col sm={12} md={6} lg={4} className="mb-3">
          <DataCard<EMSPatientCareRecord>
            record={incident}
            isValidating={isValidating}
            title="Summary"
            columns={emsDataCards.summary}
            mutation={""}
            onSaveCallback={onSaveCallback}
          />
        </Col>
        <Col sm={12} className="mb-3">
          <RelatedRecordTable<EMSPatientCareRecord, EMSLinkRecordButtonProps>
            records={ems_pcrs}
            isValidating={isValidating}
            noRowsMessage="No crashes found"
            header="EMS patient(s)"
            columns={emsDataCards.patient}
            mutation={UPDATE_EMS_INCIDENT}
            onSaveCallback={onSaveCallback}
            rowActionComponent={EMSLinkRecordButton}
            rowActionComponentAdditionalProps={linkRecordButtonProps}
          />
        </Col>
      </Row>
      {matchingPeople && (
        <Row>
          <Col sm={12} className="mb-3">
            <RelatedRecordTable<PeopleListRow, EMSLinkToPersonButtonProps>
              records={matchingPeople}
              isValidating={isValidating}
              noRowsMessage="No crashes found"
              header="Associated people records"
              columns={emsMatchingPeopleColumns}
              mutation=""
              onSaveCallback={onSaveCallback}
              rowActionComponent={EMSLinkToPersonButton}
              rowActionComponentAdditionalProps={linkToPersonButtonProps}
            />
          </Col>
        </Row>
      )}
    </>
  );
}
