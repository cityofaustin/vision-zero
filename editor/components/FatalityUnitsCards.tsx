import { Crash } from "@/types/crashes";
import { Card, ListGroupItem, Image } from "react-bootstrap";
import { getInjuryColorClass } from "@/utils/people";

interface FatalityUnitsCardsProps {
  crash: Crash;
}

/**
 * A section of the Fatality Details page that renders a unit card for every
 * unit in the crash that has a fatality, contributing factor, or charge associated with it
 */
export default function FatalityUnitsCards({ crash }: FatalityUnitsCardsProps) {
  const victims = crash.people_list_view?.filter(
    (person) => person.prsn_injry_sev_id === 4
  );
  const units = crash.units;

  const charges = crash.charges_cris;

  const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

  return (
    <div>
      {units?.map((unit) => {
        // Get the list of fatalities in the unit
        const unitVictims = victims?.filter(
          (victim) => victim.unit_nbr === unit.unit_nbr
        );
        const hasVictim = unitVictims && unitVictims.length > 0;

        // Get list of primary & possible contrib factors for the unit, excluding null & NONE
        const primaryContribFactors = [
          unit.contrib_factr,
          unit.contrib_factr_2,
          unit.contrib_factr_3,
        ].filter((factor) => !!factor && factor.label !== "NONE");
        const possibleContribFactors = [
          unit.contrib_factr_p1,
          unit.contrib_factr_p2,
        ].filter((factor) => !!factor && factor.label !== "NONE");
        const hasContribFactors =
          primaryContribFactors.length > 0 || possibleContribFactors.length > 0;

        // Get list of charges for the unit
        const unitCharges = charges?.filter(
          (charge) => charge.unit_nbr === unit.unit_nbr
        );
        const hasCharges = unitCharges && unitCharges.length > 0;

        // Show a card for units with fatalities, charges, or contrib factors
        if (hasVictim || hasCharges || hasContribFactors) {
          const unitYearMakeModel =
            `${unit.veh_mod_year || ""} ${unit.veh_make?.label || ""} ${unit.veh_mod?.label || ""}`.trim();
          return (
            <Card key={unit.id} className="mb-3">
              <Card.Header className="victim-card-header-footer">
                <div className="d-flex w-100 justify-content-start align-items-center">
                  <h5 className="mb-1 me-2">
                    <span className="fw-bold"> Unit {unit.unit_nbr}</span>
                  </h5>
                  <div className="d-flex flex-grow-1 justify-content-start text-">
                    <span>
                      {unit.unit_desc?.label}
                      {unitYearMakeModel ? ` | ${unitYearMakeModel}` : ""}
                    </span>
                  </div>
                </div>
              </Card.Header>
              {hasVictim && (
                <Card.Body>
                  {unitVictims?.map((victim) => (
                    <ListGroupItem
                      className="d-flex align-items-center justify-content-between pb-3"
                      key={victim.id}
                      style={{ border: "none" }}
                    >
                      <div className="d-flex align-items-center flex-grow-1">
                        <Image
                          alt="placeholder"
                          className="me-3"
                          src={`${BASE_PATH}/assets/img/avatars/placeholder.png`}
                          height="100px"
                        ></Image>
                        <div className="flex-grow-1">
                          <div className="w-100">
                            <div className="">
                              <span className="fw-bold me-2">
                                {victim.prsn_first_name} {victim.prsn_mid_name}{" "}
                                {victim.prsn_last_name}
                              </span>
                              {victim.prsn_type_id !== 3 && // pedalcyclist
                                // Dont show person type for cyclists or pedestrians bc its redundant
                                victim.prsn_type_id !== 4 && ( // pedestrian
                                  <small className="text-secondary">
                                    {victim.prsn_type.label}
                                  </small>
                                )}
                            </div>
                          </div>
                          <div className="mb-1 d-flex w-100 flex-column">
                            <span className="mb-2">
                              {victim.prsn_age} YEARS OLD -{" "}
                              {victim.drvr_ethncty?.label} {victim.gndr?.label}
                            </span>
                            {victim.rest?.label &&
                              // Only show restraint field for cars
                              unit.unit_desc_id === 1 && // motor vehicle
                              unit.veh_body_styl_id !== 71 && // motorycle
                              unit.veh_body_styl_id !== 90 && ( // police motorcycle
                                <span>Restraint used: {victim.rest.label}</span>
                              )}
                            {victim.prsn_exp_homelessness && (
                              <span>{victim.prsn_exp_homelessness}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {victim.injry_sev?.label && (
                        <div className="ms-3 flex-shrink-0">
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
              {(hasCharges || hasContribFactors) && (
                <Card.Footer className="victim-card-header-footer pt-0">
                  {hasCharges && (
                    <div className="pb-1">
                      <div className="fw-bold">Charges</div>
                      {unitCharges.map((charge) => (
                        <div className="ms-2" key={charge.citation_nbr}>
                          {charge.charge}
                        </div>
                      ))}
                    </div>
                  )}
                  {hasContribFactors && (
                    <div>
                      <div className="fw-bold">Contributing factors</div>
                      {primaryContribFactors.map((factor) => (
                        <div className="ms-2" key={factor?.id}>
                          <span className="fw-bold">Primary: </span>
                          <span>{factor?.label}</span>
                        </div>
                      ))}
                      {possibleContribFactors.map((factor) => (
                        <div className="ms-2" key={factor?.id}>
                          <span className="fw-bold">Possible: </span>
                          <span>{factor?.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Footer>
              )}
            </Card>
          );
        }
      })}
    </div>
  );
}
