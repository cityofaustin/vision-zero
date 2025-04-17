"use client";
import { notFound } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
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

interface MatchResult {
  ems_id: number;
  person_id: number;
  case_id: boolean;
  age: boolean;
  race: boolean;
  sex: boolean;
  address: boolean;
  date: boolean;
  score: number;
}

const useMatchSuggestions = (
  ems_pcrs?: EMSPatientCareRecord[],
  people?: PeopleListRow[]
): MatchResult[] =>
  useMemo(() => {
    const results: MatchResult[] = [];

    if (!ems_pcrs || !people) {
      return results;
    }

    ems_pcrs.forEach((ems_pcr) => {
      people.forEach((person) => {
        const matchResult: MatchResult = {
          ems_id: ems_pcr.id,
          person_id: person.id,
          case_id: false,
          age: false,
          race: false,
          sex: false,
          address: false,
          date: false,
          score: 0,
        };
        /**
         * Case ID
         */
        if (
          person.crash?.case_id &&
          ems_pcr.unparsed_apd_incident_numbers?.includes(person.crash.case_id)
        ) {
          matchResult.case_id = true;
          matchResult.score++;
        }
        /**
         * Age
         */
        if (
          ems_pcr.pcr_patient_age !== null &&
          person.prsn_age !== null &&
          ems_pcr.pcr_patient_age === person.prsn_age
        ) {
          matchResult.age = true;
          matchResult.score++;
        }
        /**
         * Sex
         */
        if (
          ems_pcr.pcr_patient_gender &&
          person.gndr.label.toLowerCase() ===
            ems_pcr.pcr_patient_gender?.toLowerCase()
        ) {
          matchResult.sex = true;
          matchResult.score++;
        }
        results.push(matchResult);
      });
    });
    return results;
  }, [ems_pcrs, people]);

const allowedLinkRecordRoles = ["vz-admin", "editor"];

export default function EMSDetailsPage({
  params,
}: {
  params: { incident_number: string };
}) {
  const [selectedEmsPcr, setSelectedEmsPcr] =
    useState<EMSPatientCareRecord | null>(null);

  const incident_number = params.incident_number;

  /** */
  const {
    data: ems_pcrs,
    error,
    isValidating,
    refetch,
  } = useQuery<EMSPatientCareRecord>({
    query: incident_number ? GET_EMS_RECORDS : null,
    // if ID is provided, query for it, coercing non-numbers to zero and
    // thereby triggering the 404
    variables: {
      incident_number: incident_number,
    },
    typename: "ems__incidents",
  });

  const { mutate: updateEMSIncident, loading: isMutating } = useMutation(
    UPDATE_EMS_INCIDENT_CRASH_AND_PERSON
  );

  /**
   * Treat the first record found as the "incident"
   */
  const incident = ems_pcrs?.[0];

  const matchedCrashPks = incident?.crash_pk
    ? [incident.crash_pk]
    : incident?.matched_crash_pks;

  const {
    data: matchingPeople,
    // error: matchingPeopleError,
    // isValidating: isValidatingCrashMatches,
    // refetch: refetchMatchingPeople,
  } = useQuery<PeopleListRow>({
    query: matchedCrashPks ? GET_MATCHING_PEOPLE : null,
    variables: {
      crash_pks: matchedCrashPks,
    },
    typename: "people_list_view",
  });

  const matchResults = useMatchSuggestions(ems_pcrs, matchingPeople);
  const onSaveCallback = useCallback(async () => {
    await refetch();
  }, [refetch]);

  if (error) {
    console.error(error);
  }

  // When data is loaded or updated this sets the title of the page inside the HTML head element
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
            rowActionComponentAdditionalProps={{
              onClick: (emsPcr) => {
                setSelectedEmsPcr((prevEmsPcr) => {
                  return prevEmsPcr?.id === emsPcr?.id ? null : emsPcr;
                });
              },
              selectedEmsPcr: selectedEmsPcr,
            }}
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
              rowActionComponentAdditionalProps={{
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
              }}
            />
          </Col>
        </Row>
      )}
    </>
  );
}
