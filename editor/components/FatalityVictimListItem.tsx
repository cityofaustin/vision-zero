import { ListGroupItem } from "react-bootstrap";
import FatalityImageUploadModal from "@/components/FatalityImageUploadModal";
import PersonImage from "@/components/PersonImage";
import { PeopleListRow } from "@/types/peopleList";
import { getInjuryColorClass } from "@/utils/people";
import { useState, useEffect } from "react";
import { Unit } from "@/types/unit";
import { useGetToken, hasRole } from "@/utils/auth";
import { useAuth0 } from "@auth0/auth0-react";

interface FatalityVictimListItemProps {
  victim: PeopleListRow;
  unit: Unit;
}

/** Returns false if the unit is not a car
 */
const shouldShowRestraintField = (unit: Unit) =>
  unit.unit_desc_id === 1 && // motor vehicle
  unit.veh_body_styl_id !== 71 && // motorcycle
  unit.veh_body_styl_id !== 90; // police motorcycle

/** If person is a cyclist or pedestrian return null bc it would be redundant to render,
 * otherwise return person type label with formatting if needed
 */
const getPersonType = (victim: PeopleListRow) =>
  victim.prsn_type_id !== 3 && // pedalcyclist
  victim.prsn_type_id !== 4 // pedestrian
    ? victim.prsn_type_id === 5 //mot
      ? "DRIVER OF MOTORCYCLE" // Reformat this person type bc its really long
      : victim.prsn_type?.label
    : null;

/**
 * This component is rendered for each victim in the FatalityUnitsCards component.
 * It renders person info, the person image, and person image upload modal
 */
export default function FatalityVictimListItem({
  victim,
  unit,
}: FatalityVictimListItemProps) {
  const [showModal, setShowModal] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  // Used to force a re-mount of PersonImage after new image is uploaded in modal
  const [imageVersion, setImageVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const getToken = useGetToken();

  const victimName = [
    victim.prsn_first_name,
    victim.prsn_mid_name,
    victim.prsn_last_name,
  ]
    .filter((n) => n)
    .join(" ");

  const personId = victim.id;

  // Tries to fetch the person image from the API and sets the url state
  useEffect(() => {
    const fetchImage = async () => {
      if (!personId) {
        setImageUrl(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const token = await getToken();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_CR3_API_DOMAIN}/images/person/${personId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // No image exists
        if (response.status === 404) {
          setImageUrl(null);
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        setImageUrl(data.url);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching person image:", err);
        setImageUrl(null);
        setIsLoading(false);
      }
    };

    fetchImage();
  }, [personId, getToken, imageVersion]);

  const { user } = useAuth0();

  const isReadOnlyUser = user && hasRole(["readonly"], user);

  return (
    <ListGroupItem
      className="d-flex align-items-center justify-content-between pb-3"
      key={victim.id}
      style={{ border: "none" }}
    >
      {!isReadOnlyUser && (
        <FatalityImageUploadModal
          showModal={showModal}
          setShowModal={setShowModal}
          victimName={victimName}
          personId={victim.id}
          storedUrl={imageUrl}
          isLoading={isLoading}
          setImageVersion={setImageVersion}
        />
      )}

      <div className="d-flex align-items-center">
        <PersonImage
          key={`${victim.id}-${imageVersion}`} // Changing this key forces a re-mount
          onClick={() => setShowModal(true)}
          imageUrl={imageUrl}
          isLoading={isLoading}
          isReadOnlyUser={isReadOnlyUser}
        />
        <div className="d-flex flex-column">
          <div className="pb-1">
            <span className="fw-bold me-2">{victimName}</span>
            <small className="text-secondary">{getPersonType(victim)}</small>
          </div>
          <span className="pb-1">
            {victim.prsn_age ? `${victim.prsn_age} YEARS OLD - ` : ""}
            {victim.drvr_ethncty?.label} {victim.gndr?.label}
          </span>
          {victim.rest?.label && shouldShowRestraintField(unit) && (
            <span className="pb-1">Restraint used: {victim.rest?.label}</span>
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
  );
}
