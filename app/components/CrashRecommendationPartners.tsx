import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import {
  CoordinationPartner,
  RecommendationPartner,
} from "@/types/recommendation";
import { RecommendationFormInputs } from "@/types/recommendation";

interface CrashRecommendationPartersProps {
  partners: CoordinationPartner[];
  setValue: UseFormSetValue<RecommendationFormInputs>;
  watch: UseFormWatch<RecommendationFormInputs>;
}

/**
 * Multiselect form component for editing crash recommendation
 * partners
 */
export default function CrashRecommendationParters({
  setValue,
  watch,
  partners,
}: CrashRecommendationPartersProps) {
  const selectedPartners = watch("recommendations_partners");

  const togglePartner = (id: number, add: boolean) => {
    let updated: Partial<RecommendationPartner>[] = selectedPartners || [];
    if (add) {
      updated.push({ partner_id: id });
    } else {
      updated = updated.filter((partner) => partner.partner_id !== id) || null;
    }
    setValue("recommendations_partners", updated, { shouldDirty: true });
  };

  return (
    <ListGroup>
      {partners.map((partner) => {
        const checked = Boolean(
          selectedPartners?.find((val) => val.partner_id === partner.id)
        );
        return (
          <ListGroup.Item
            key={partner.id}
            action
            onClick={(e) => {
              e.preventDefault();
              togglePartner(partner.id, !checked);
            }}
          >
            <Form.Check
              label={partner.coord_partner_desc}
              checked={checked}
              onChange={() => null}
              style={{ pointerEvents: "none" }}
            />
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
}
