"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import DataCard from "@/components/DataCard";
import { useMutation, useQuery } from "@/utils/graphql";
import {
  GET_EMS_RECORDS,
  GET_MATCHING_PEOPLE,
  GET_UNMATCHED_EMS_CRASHES,
  UPDATE_EMS_INCIDENT,
  UPDATE_EMS_INCIDENT_CRASH_AND_PERSON,
} from "@/queries/ems";
import { UPDATE_PERSON } from "@/queries/person";
import { EMSPatientCareRecord } from "@/types/ems";
import RelatedRecordTable from "@/components/RelatedRecordTable";
import EMSLinkRecordButton, {
  EMSLinkRecordButtonProps,
} from "@/components/EMSLinkRecordButton";
import EMSLinkToPersonButton, {
  EMSLinkToPersonButtonProps,
} from "@/components/EMSLinkToPersonButton";
import { emsDataCards } from "@/configs/emsDataCards";
import { emsMatchingPeopleColumns } from "@/configs/emsMatchingPeopleColumns";
import { getMutationVariables } from "@/configs/emsRelatedRecordTable";
import { PeopleListRow } from "@/types/peopleList";
import { FaTruckMedical } from "react-icons/fa6";
import { parseISO, subHours, addHours } from "date-fns";
import { Crash } from "@/types/crashes";

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
    refetch: refetchEMS,
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
   * Use the first EMS record as the "incident"
   */
  const incident = ems_pcrs?.[0];

  /**
   * Hook which manages which related crash PKs we should
   * use to query people records
   */
  const matchedCrashPks: number[] = useMemo(() => {
    if (!ems_pcrs) {
      return [];
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
   * Hook that gets the 4 hour timestamp interval
   * to be used for fetching people list for unmatched EMS records
   */
  const unmatchedTimeInterval: string[] = useMemo(() => {
    if (incident?.incident_received_datetime) {
      // Return time interval only if the record doesnt have a crash_pk or any matched_crash_pks
      if (
        ems_pcrs?.some(
          (ems) =>
            ems.crash_pk === null &&
            (ems.matched_crash_pks === null ||
              ems.matched_crash_pks.length === 0)
        )
      ) {
        const incidentTimestamp = parseISO(incident.incident_received_datetime);
        const time4HoursBefore = subHours(incidentTimestamp, 4).toISOString();
        const time4HoursAfter = addHours(incidentTimestamp, 4).toISOString();
        return [time4HoursBefore, time4HoursAfter];
      }
    }
    return [];
  }, [incident, ems_pcrs]);

  /**
   * Get all crash records that occurred within 12 hours of the incidents
   * if any of the ems pcrs are unmatched
   */
  const { data: unmatchedCrashes } = useQuery<Crash>({
    query: unmatchedTimeInterval[0] ? GET_UNMATCHED_EMS_CRASHES : null,
    variables: {
      time4HoursBefore: unmatchedTimeInterval[0],
      time4HoursAfter: unmatchedTimeInterval[1],
    },
    typename: "crashes",
  });

  const unmatchedCrashPks: number[] = unmatchedCrashes
    ? unmatchedCrashes?.map((crash) => crash.id)
    : [];

  // Combine and dedupe related crash and unmatched crash pks
  const allCrashPks = Array.from(
    new Set([...matchedCrashPks, ...unmatchedCrashPks])
  );

  /**
   * Get all people records linked to crashes that were either automatically
   * matched with the ems record or that occurred within 12 hours of the incident
   * if it has a crash status of unmatched
   */
  const { data: matchingPeople, refetch: refetchPeople } =
    useQuery<PeopleListRow>({
      query: allCrashPks[0] ? GET_MATCHING_PEOPLE : null,
      variables: {
        crash_pks: unmatchedTimeInterval[0] ? allCrashPks : matchedCrashPks,
      },
      typename: "people_list_view",
      options: {
        keepPreviousData: false,
      },
    });

  const onSaveCallback = useCallback(async () => {
    await refetchEMS();
    await refetchPeople();
  }, [refetchEMS, refetchPeople]);

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
      onClick: (emsId, personId) => {
        updateEMSIncident({
          id: emsId,
          person_id: personId,
        })
          .then(() => refetchEMS())
          .then(() => refetchPeople())
          .then(() => {
            setSelectedEmsPcr(null);
          });
      },
      selectedEmsPcr: selectedEmsPcr,
    }),
    [updateEMSIncident, selectedEmsPcr, refetchEMS, refetchPeople]
  );

  if (error) {
    console.error(error);
  }

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
            noRowsMessage="No patients found"
            header="EMS patient(s)"
            columns={emsDataCards.patient}
            mutation={UPDATE_EMS_INCIDENT}
            getMutationVariables={getMutationVariables}
            onSaveCallback={onSaveCallback}
            rowActionComponent={EMSLinkRecordButton}
            rowActionComponentAdditionalProps={linkRecordButtonProps}
            rowActionMutation={UPDATE_EMS_INCIDENT}
            shouldShowColumnVisibilityPicker={true}
            localStorageKey="emsIncidentDetailsPatients"
          />
        </Col>
      </Row>
      <Row>
        <Col sm={12} className="mb-3">
          <RelatedRecordTable<PeopleListRow, EMSLinkToPersonButtonProps>
            records={matchingPeople ? matchingPeople : []}
            isValidating={isValidating}
            noRowsMessage="No people found"
            header="Possible people matches"
            columns={emsMatchingPeopleColumns}
            mutation={UPDATE_PERSON}
            onSaveCallback={onSaveCallback}
            rowActionComponent={EMSLinkToPersonButton}
            rowActionComponentAdditionalProps={linkToPersonButtonProps}
            shouldShowColumnVisibilityPicker={true}
            localStorageKey="emsPossiblePeople"
          />
        </Col>
      </Row>
    </>
  );
}
