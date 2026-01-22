import { Crash } from "@/types/crashes";
import { Unit } from "@/types/unit";
import { Card, ListGroupItem, Image, Form } from "react-bootstrap";
import { getInjuryColorClass } from "@/utils/people";
import FatalityUnitCardFooter from "@/components/FatalityUnitCardFooter";
import { PeopleListRow } from "@/types/peopleList";
import { useMemo, useState } from "react";

interface FatalityUnitsCardsProps {
  crash: Crash;
}

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** Builds the year make and model string */
const getUnitYearMakeModel = (unit: Unit) => {
  const unitYearMakeModel =
    `${unit.veh_mod_year || ""} ${unit.veh_make?.label || ""} ${unit.veh_mod?.label || ""}`.trim() ||
    "";
  return unitYearMakeModel ? ` | ${unitYearMakeModel}` : "";
};

/** Returns false if the unit is not a car
 */
const shouldShowRestraintField = (unit: Unit) =>
  unit.unit_desc_id === 1 && // motor vehicle
  unit.veh_body_styl_id !== 71 && // motorycle
  unit.veh_body_styl_id !== 90; // police motorcycle

/** If person is a cyclist or pedestrian return null bc it would be redundant to render,
 * otherwise return person type label with formatting if needed
 */
const getPersonType = (victim: PeopleListRow) =>
  victim.prsn_type_id !== 3 && // pedalcyclist
  victim.prsn_type_id !== 4 // pedestrian
    ? victim.prsn_type_id === 5 //mot
      ? "DRIVER OF MOTORCYCLE" // Reformat this person type bc its really long
      : victim.prsn_type.label
    : null;

/** Process crash data and return an enriched list of unit objects to be rendered in the
 * unit cards. Filters out units that dont have any fatalities, charges, or contrib factors
 */
const getUnitDisplayData = (crash: Crash, showAllUnits: boolean) => {
  const victims = crash.people_list_view?.filter(
    (person) => person.prsn_injry_sev_id === 4
  );
  const units = crash.units;
  const charges = crash.charges_cris;

  const unitsData = units
    ?.map((unit) => {
      const unitVictims = victims?.filter(
        (victim) => victim.unit_nbr === unit.unit_nbr
      );

      const primaryContribFactors = [
        unit.contrib_factr,
        unit.contrib_factr_2,
        unit.contrib_factr_3,
      ].filter((factor) => !!factor && factor.label !== "NONE");

      const possibleContribFactors = [
        unit.contrib_factr_p1,
        unit.contrib_factr_p2,
      ].filter((factor) => !!factor && factor.label !== "NONE");

      const unitCharges = charges?.filter(
        (charge) => charge.unit_nbr === unit.unit_nbr
      );

      const hasCharges = unitCharges && unitCharges.length > 0;
      const hasVictim = unitVictims && unitVictims.length > 0;
      const hasContribFactors =
        primaryContribFactors.length > 0 || possibleContribFactors.length > 0;

      const unitYearMakeModel = getUnitYearMakeModel(unit);

      return {
        ...unit,
        unitVictims,
        primaryContribFactors,
        possibleContribFactors,
        unitCharges,
        hasCharges,
        hasVictim,
        hasContribFactors,
        unitYearMakeModel,
      };
    })
    .filter((data) => (showAllUnits ? true : data.hasVictim));

  return unitsData;
};

/**
 * A section of the Fatality Details page that renders a unit card for every
 * unit in the crash that has a fatality, contributing factor, or charge associated with it
 */
export default function FatalityUnitsCards({ crash }: FatalityUnitsCardsProps) {
  const [showAllUnits, setShowAllUnits] = useState(true);
  const unitDataReadyToRender = useMemo(
    () => getUnitDisplayData(crash, showAllUnits),
    [crash, showAllUnits]
  );

  const isSingleUnitCrash = crash.units?.length === 1;
  const isSingleVictimCrash =
    unitDataReadyToRender?.filter((unit) => unit.hasVictim).length || 0 < 2;

  return (
    <>
      <Card className="p-2 h-100">
        <div className="px-2 py-1 mb-1 d-flex flex-row justify-content-between">
          <div className="fs-5 fw-bold">
            {showAllUnits && !isSingleUnitCrash
              ? "Units involved"
              : `Victim${isSingleVictimCrash ? "" : "s"}`}
          </div>
          <Form.Label className="d-flex align-items-center mb-0">
            <span className="me-2 text-secondary">Show all units</span>
            <Form.Check
              type="switch"
              checked={showAllUnits}
              disabled={isSingleUnitCrash}
              onChange={(e) => setShowAllUnits(e.target.checked)}
            />
          </Form.Label>
        </div>
        {unitDataReadyToRender?.map((unit, i) => (
          <Card
            key={unit.id}
            className={i < unitDataReadyToRender.length - 1 ? "mb-2" : ""}
          >
            <Card.Header className="fatality-units-card-header-footer">
              <div className="d-flex w-100 justify-content-start align-items-center">
                <span className="fs-5 fw-bold me-2">Unit {unit.unit_nbr}</span>
                <span>
                  {unit.unit_desc?.label} {unit.unitYearMakeModel}
                </span>
              </div>
            </Card.Header>
            {unit.hasVictim && (
              <Card.Body>
                {unit.unitVictims?.map((victim) => (
                  <ListGroupItem
                    className="d-flex align-items-center justify-content-between pb-3"
                    key={victim.id}
                    style={{ border: "none" }}
                  >
                    <div className="d-flex align-items-center">
                      <Image
                        alt="placeholder"
                        className="me-3"
                        src={`${BASE_PATH}/assets/img/avatars/placeholder.png`}
                        height="100px"
                      ></Image>
                      <div className="d-flex w-100 flex-column">
                        <div className="pb-1">
                          <span className="fw-bold me-2">
                            {victim.prsn_first_name} {victim.prsn_mid_name}{" "}
                            {victim.prsn_last_name}
                          </span>
                          <small className="text-secondary">
                            {getPersonType(victim)}
                          </small>
                        </div>
                        <span className="pb-1">
                          {victim.prsn_age} YEARS OLD -{" "}
                          {victim.drvr_ethncty?.label} {victim.gndr?.label}
                        </span>
                        {victim.rest?.label &&
                          shouldShowRestraintField(unit) && (
                            <span className="pb-1">
                              Restraint used: {victim.rest.label}
                            </span>
                          )}
                        {!!victim.prsn_exp_homelessness && (
                          <span>{"Suspected unhoused"}</span>
                        )}
                      </div>
                    </div>
                    {victim.injry_sev?.label && (
                      <div className="ms-2 flex-shrink-0">
                        <span
                          className={`${getInjuryColorClass(victim.injry_sev.label)} px-2 py-1 rounded`}
                        >
                          {victim.injry_sev?.label}
                        </span>
                      </div>
                    )}
                  </ListGroupItem>
                ))}
              </Card.Body>
            )}
            {(unit.hasCharges || unit.hasContribFactors) && (
              <FatalityUnitCardFooter
                hasCharges={unit.hasCharges}
                hasVictim={unit.hasVictim}
                hasContribFactors={unit.hasContribFactors}
                unitCharges={unit.unitCharges}
                primaryContribFactors={unit.primaryContribFactors}
                possibleContribFactors={unit.possibleContribFactors}
              />
            )}
          </Card>
        ))}
      </Card>
    </>
  );
}
