"use client";
import { useMemo } from "react";
import { EMSPatientCareRecord } from "@/types/ems";
import { PeopleListRow } from "@/types/peopleList";

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

/**
 * basic proof of concept for scoring an ems - person match
 */
export const useMatchSuggestions = (
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
          person.gndr?.label.toLowerCase() ===
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
