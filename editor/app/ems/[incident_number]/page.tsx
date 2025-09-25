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
  GET_NON_CR3_CRASHES,
  UPDATE_EMS_PCR,
  UPDATE_EMS_PCR_CRASH_AND_PERSON,
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
import { emsMatchingPeopleColumns } from "@/configs/emsMatchingPeopleColumns";
import { emsNonCR3Columns } from "@/configs/nonCR3Columns";
import { emsDataCards } from "@/configs/emsDataCards";
import { getMutationVariables } from "@/configs/emsRelatedRecordTable";
import { PeopleListRow } from "@/types/peopleList";
import { FaTruckMedical } from "react-icons/fa6";
import { parseISO, subHours, addHours } from "date-fns";
import { Crash } from "@/types/crashes";
import EMSMapCard from "@/components/EMSMapCard";
import { NonCR3Record } from "@/types/nonCr3";

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

  const { mutate: updateEmsPcr } = useMutation(UPDATE_EMS_PCR_CRASH_AND_PERSON);

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

  /** Array of Non-CR3 case IDs that are possible matches for this incident */
  const possibleNonCR3Matches = incident
    ? incident.matched_non_cr3_case_ids
    : null;

  /** The single case ID matched to this incident if it doesn't have multiple
   * matches or has been matched by review/QA
   */
  const matchedNonCr3CaseId = incident
    ? incident.atd_apd_blueform_case_id
    : null;

  /**
   * Get all matching Non-CR3 records
   */
  const { data: nonCR3Crashes } = useQuery<NonCR3Record>({
    query:
      matchedNonCr3CaseId || possibleNonCR3Matches ? GET_NON_CR3_CRASHES : null,
    variables: {
      // If there is already a single case ID that has been matched then query that,
      // otherwise query the list of possible Non-CR3 matches
      case_ids: matchedNonCr3CaseId
        ? matchedNonCr3CaseId
        : possibleNonCR3Matches,
    },
    typename: "atd_apd_blueform",
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
        updateEmsPcr({
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
    [updateEmsPcr, selectedEmsPcr, refetchEMS, refetchPeople]
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
            title="Summary"
            columns={emsDataCards.summary}
            mutation={""}
          />
        </Col>
        <Col sm={12} md={6} lg={8} className="mb-3">
          <EMSMapCard
            savedLatitude={incident.latitude}
            savedLongitude={incident.longitude}
          />
        </Col>
      </Row>
      <Row>
        <Col sm={12} className="mb-3">
          <RelatedRecordTable<EMSPatientCareRecord, EMSLinkRecordButtonProps>
            records={ems_pcrs}
            isValidating={isValidating}
            noRowsMessage="No patients found"
            header="EMS patient(s)"
            columns={emsDataCards.patient}
            mutation={UPDATE_EMS_PCR}
            getMutationVariables={getMutationVariables}
            onSaveCallback={onSaveCallback}
            rowActionComponent={EMSLinkRecordButton}
            rowActionComponentAdditionalProps={linkRecordButtonProps}
            rowActionMutation={UPDATE_EMS_PCR}
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
      <Row>
        <Col sm={12} className="mb-3">
          <RelatedRecordTable
            records={nonCR3Crashes ? nonCR3Crashes : []}
            noRowsMessage="No non-CR3 crashes found"
            header="Possible non-CR3 matches"
            columns={emsNonCR3Columns}
            mutation=""
            onSaveCallback={onSaveCallback}
          />
        </Col>
      </Row>
    </>
  );
}
