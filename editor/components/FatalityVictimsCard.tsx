import { Crash } from "@/types/crashes";
import { Card, ListGroup, ListGroupItem } from "react-bootstrap";
import { getInjuryColorClass } from "@/utils/people";

interface FatalityVictimsCardProps {
  crash: Crash;
}

export default function FatalityVictimsCard({
  crash,
}: FatalityVictimsCardProps) {
  const victims = crash.people_list_view?.filter(
    (person) => person.prsn_injry_sev_id === 4
  );
  const units = crash.units;

  if (!victims) {
    return;
  }
  return (
    <Card>
      <Card.Header>
        <Card.Title>Victims</Card.Title>
      </Card.Header>
      <Card.Body className="pt-1">
        <ListGroup variant="flush">
          {units?.map((unit) => {
            const unitVictims = victims?.filter(
              (victim) => victim.unit_nbr === unit.unit_nbr
            );
            if (unitVictims?.length > 0) {
              const unitYearMakeModel =
                `${unit.veh_mod_year || ""} ${unit.veh_make?.label || ""} ${unit.veh_mod?.label || ""}`.trim();
              return (
                <ListGroupItem key={unit.id}>
                  <div className="d-flex w-100 justify-content-start align-items-center">
                    <h5 className="mb-1 me-2">
                      <span className="fw-bold"> Unit {unit.unit_nbr}</span>
                    </h5>
                    <div className="d-flex flex-grow-1 justify-content-start text-secondary">
                      <span>
                        {unit.unit_desc?.label}
                        {unitYearMakeModel ? ` | ${unitYearMakeModel}` : ""}
                      </span>
                    </div>
                  </div>
                  {unitVictims?.map((victim) => (
                    <ListGroupItem key={victim.id} style={{ border: "none" }}>
                      <div className="d-flex w-100 justify-content-between">
                        <div className="d-flex align-items-center">
                          <span className="fw-bold me-2">
                            {victim.prsn_first_name} {victim.prsn_mid_name}{" "}
                            {victim.prsn_last_name}
                          </span>
                          {victim.prsn_type_id !== 3 &&
                            // Dont show person type for cyclists or pedestrians bc its redundant
                            victim.prsn_type_id !== 4 && (
                              <small className="text-secondary">
                                {victim.prsn_type.label}
                              </small>
                            )}
                        </div>
                        {victim.injry_sev?.label && (
                          <span
                            className={`${getInjuryColorClass(victim.injry_sev.label)} d-inline-flex align-items-center justify-content-center px-2 py-1 rounded `}
                            style={{ minWidth: "fit-content" }}
                          >
                            <small>{victim.injry_sev?.label}</small>
                          </span>
                        )}
                      </div>
                      <div className="mb-1 d-flex w-100 flex-column">
                        <span className="mb-2">
                          {victim.prsn_age} YEARS OLD -{" "}
                          {victim.drvr_ethncty.label} {victim.gndr.label}
                        </span>
                        {victim.rest?.label &&
                          // Only show restraint field for cars
                          unit.unit_desc_id === 1 &&
                          unit.veh_body_styl_id !== 71 &&
                          unit.veh_body_styl_id !== 90 && (
                            <span>Restraint used: {victim.rest.label}</span>
                          )}
                        {victim.prsn_exp_homelessness && (
                          <span>{victim.prsn_exp_homelessness}</span>
                        )}
                      </div>
                    </ListGroupItem>
                  ))}
                </ListGroupItem>
              );
            }
          })}
        </ListGroup>
      </Card.Body>
    </Card>
  );
}
