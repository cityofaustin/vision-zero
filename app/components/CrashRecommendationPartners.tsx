import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import {
  Recommendation,
  CoordinationPartner,
  RecommendationPartner,
} from "@/types/recommendation";
import { RecommendationFormInputs } from "./CrashRecommendationCard";

export default function CrashRecommendationParters({
  setValue,
  watch,
  partners,
}: {
  setValue: UseFormSetValue<RecommendationFormInputs>;
  partners: CoordinationPartner[];
  watch: UseFormWatch<RecommendationFormInputs>;
}) {
  const selectedPartners = watch("recommendations_partners");

  const togglePartner = (id: number, add: boolean) => {
    let updated: Partial<RecommendationPartner>[] = selectedPartners || [];
    if (add) {
      updated.push({ partner_id: id });
    } else {
      updated = updated.filter((partner) => partner.partner_id !== id) || null;
    }
    setValue("recommendations_partners", updated);
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
              style={{ pointerEvents: "none" }}
            />
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
}
