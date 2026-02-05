import { Crash } from "@/types/crashes";
import { Unit } from "@/types/unit";
import { Card, Form } from "react-bootstrap";
import FatalityUnitCardFooter from "@/components/FatalityUnitCardFooter";
import { useMemo, useState } from "react";
import FatalityVictimListItem from "@/components/FatalityVictimListItem";

interface FatalityUnitsCardsProps {
  crash: Crash;
}

/** Builds the year make and model string */
const getUnitYearMakeModel = (unit: Unit) => {
  const unitYearMakeModel =
    `${unit.veh_mod_year || ""} ${unit.veh_make?.label || ""} ${unit.veh_mod?.label || ""}`.trim() ||
    "";
  return unitYearMakeModel ? ` | ${unitYearMakeModel}` : "";
};

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

  return (
    <>
      <Card className="h-100">
        <Card.Header>
          <div className="d-flex flex-row justify-content-between">
            <div className="fs-5 fw-bold">
              {showAllUnits && !isSingleUnitCrash
                ? "Units involved"
                : "Victims"}
            </div>
            <Form.Label
              className="d-flex align-items-center mb-0"
              style={{ cursor: isSingleUnitCrash ? "auto" : "pointer" }}
            >
              <span className="me-2 text-secondary">Show all units</span>
              <Form.Check
                type="switch"
                checked={showAllUnits}
                disabled={isSingleUnitCrash}
                onChange={(e) => setShowAllUnits(e.target.checked)}
                style={{ pointerEvents: "none" }}
              />
            </Form.Label>
          </div>
        </Card.Header>
        <Card.Body>
          {unitDataReadyToRender?.map((unit, i) => (
            <Card
              key={unit.id}
              className={i < unitDataReadyToRender.length - 1 ? "mb-2" : ""}
            >
              <Card.Header className="fatality-units-card-header-footer">
                <div className="d-flex w-100 justify-content-start align-items-center">
                  <span className="fs-5 fw-bold me-2">
                    Unit {unit.unit_nbr}
                  </span>
                  <span>
                    {unit.unit_desc?.label} {unit.unitYearMakeModel}
                  </span>
                </div>
              </Card.Header>
              {unit.hasVictim && (
                <Card.Body>
                  {unit.unitVictims?.map((victim) => {
                    return (
                      <FatalityVictimListItem
                        key={victim.id}
                        victim={victim}
                        unit={unit}
                      />
                    );
                  })}
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
        </Card.Body>
      </Card>
    </>
  );
}
