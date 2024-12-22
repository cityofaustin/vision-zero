import { useState } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";

import Spinner from "react-bootstrap/Spinner";
import { useForm } from "react-hook-form";
import { trimStringNullable } from "@/utils/formHelpers";
import { useQuery, useMutation } from "@/utils/graphql";
import CrashRecommendationParters from "./CrashRecommendationPartners";
import {
  RECOMMENDATION_STATUS_QUERY,
  RECOMMENDATION_PARTNERS_QUERY,
  INSERT_RECOMMENDATION_MUTATION,
  UPDATE_RECOMMENDATION_MUTATION,
} from "@/queries/recommendations";
import {
  Recommendation,
  RecommendationStatus,
  RecommendationPartner,
  CoordinationPartner,
  RecommendationFormInputs,
} from "@/types/recommendation";
import { useAuth0 } from "@auth0/auth0-react";

const DEFAULT_VALUES = {
  rec_text: null,
  rec_update: null,
  recommendation_status_id: null,
};

const getPartnerChanges = (
  recommendationId: number | null,
  partnersOld: Partial<RecommendationPartner>[],
  partnersNew: Partial<RecommendationPartner>[]
) => {
  const addPartners: Partial<RecommendationPartner>[] = [];
  const deletePartnerPks: number[] = [];

  if (partnersOld.length > 0) {
    // check if any partners have been removed
    partnersOld.forEach((partnerOld) => {
      if (
        !partnersNew.find(
          (partnerNew) => partnerNew.partner_id === partnerOld.partner_id
        )
      ) {
        // delete this partner - so grab it's PK
        deletePartnerPks.push(partnerOld.id!);
      }
    });
  }

  if (partnersNew.length > 0) {
    // check if any partners need to be added
    partnersNew.forEach((partnerNew) => {
      if (
        !partnersOld.find(
          (partnerOld) => partnerNew.partner_id === partnerOld.partner_id
        )
      ) {
        // add this partner
        addPartners.push({
          partner_id: partnerNew.partner_id,
          ...(recommendationId && {
            recommendation_id: recommendationId,
          }),
        });
      }
    });
  }
  return [addPartners, deletePartnerPks];
};

export default function CrashRecommendationCard({
  recommendation,
  crash_pk,
  onSaveCallback,
}: {
  recommendation: Recommendation | null;
  crash_pk: number;
  onSaveCallback: () => Promise<void>;
}) {
  const { user } = useAuth0();
  const [isEditing, setIsEditing] = useState(false);
  const { data: statuses, isLoading: isLoadingStatuses } =
    useQuery<RecommendationStatus>({
      query: isEditing ? RECOMMENDATION_STATUS_QUERY : null,
      typename: "statuses",
    });

  const { data: partners, isLoading: isLoadingPartners } =
    useQuery<CoordinationPartner>({
      query: isEditing ? RECOMMENDATION_PARTNERS_QUERY : null,
      typename: "partners",
    });

  const {
    register,
    reset,
    handleSubmit,
    formState: { isDirty },
    setValue,
    watch,
  } = useForm<RecommendationFormInputs>({
    defaultValues: recommendation
      ? {
          rec_text: recommendation.rec_text,
          rec_update: recommendation.rec_update,
          recommendation_status_id: recommendation.recommendation_status_id,
          crash_pk: recommendation.crash_pk,
          recommendations_partners:
            recommendation.recommendations_partners || [],
        }
      : {
          ...DEFAULT_VALUES,
          crash_pk,
          created_by: user?.email,
          recommendations_partners: [],
        },
  });

  const isNewRec = !recommendation;
  const { mutate } = useMutation(
    isNewRec ? INSERT_RECOMMENDATION_MUTATION : UPDATE_RECOMMENDATION_MUTATION
  );

  const onSave = async (data: RecommendationFormInputs) => {
    // just use a generic object to make the data structuring easier
    const payload: Record<string, unknown> = data;

    const [addPartners, deletePartnerPks] = getPartnerChanges(
      recommendation?.id || null,
      recommendation?.recommendations_partners || [],
      data.recommendations_partners || []
    );

    // coerce empty fields to null
    payload.rec_text = trimStringNullable(data.rec_text || "");
    payload.rec_update = trimStringNullable(data.rec_update || "");
    payload.recommendation_status_id =
      Number(data.recommendation_status_id) || null;

    let variables;
    if (!isNewRec) {
      delete payload.recommendations_partners;
      variables = {
        object: payload,
        id: recommendation?.id,
        addPartners,
        deletePartnerPks,
      };
    } else {
      payload.recommendations_partners = { data: addPartners };
      variables = { object: payload };
    }
    // save and refetch
    await mutate(variables, { skip_updated_by_setter: true });
    await onSaveCallback();
    setIsEditing(false);
  };

  return (
    <Card>
      <Card.Header>
        <div className="d-flex justify-content-between">
          <span>Fatality Review Board Recommendations</span>
          {!isEditing && (
            <Button
              size="sm"
              variant="primary"
              onClick={async () => {
                setIsEditing(true);
              }}
            >
              Edit
            </Button>
          )}
        </div>
      </Card.Header>
      <Card.Body>
        <Form id="recommendationForm" onSubmit={handleSubmit(onSave)}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Recommendation</Form.Label>
            {isEditing && (
              <Form.Control
                {...register("rec_text")}
                as="textarea"
                rows={6}
                autoFocus={true}
              />
            )}
            {!isEditing && <p>{recommendation?.rec_text || ""}</p>}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Update</Form.Label>
            {isEditing && (
              <Form.Control
                {...register("rec_update")}
                as="textarea"
                rows={6}
              />
            )}
            {!isEditing && <p>{recommendation?.rec_update || ""}</p>}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Partners</Form.Label>
            {!isEditing && (
              <p>
                {recommendation?.recommendations_partners
                  ?.map(
                    (x) => x.atd__coordination_partners_lkp?.coord_partner_desc
                  )
                  .join(",") || ""}
              </p>
            )}
            {isEditing && isLoadingPartners && <Spinner size="sm" />}
            {isEditing && partners && (
              <CrashRecommendationParters
                setValue={setValue}
                watch={watch}
                partners={partners}
              />
            )}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Status</Form.Label>
            {isEditing && !isLoadingStatuses && statuses && (
              <Form.Select {...register("recommendation_status_id")}>
                <option value="">Select status...</option>
                {statuses.map((option) => (
                  <option key={option.id} value={String(option.id)}>
                    {option.rec_status_desc}
                  </option>
                ))}
              </Form.Select>
            )}
            {isEditing && isLoadingStatuses && <Spinner size="sm" />}
            {!isEditing && (
              <p>
                {recommendation?.atd__recommendation_status_lkp
                  ?.rec_status_desc || ""}
              </p>
            )}
          </Form.Group>
        </Form>
        {!recommendation && <p>No recommendation</p>}
      </Card.Body>
      <Card.Footer>
        <div className="d-flex justify-content-end">
          {isEditing && (
            <Button
              size="sm"
              variant="primary"
              disabled={!isDirty}
              form="recommendationForm"
              type="submit"
            >
              Save
            </Button>
          )}
          {isEditing && (
            <Button
              className="ms-1"
              size="sm"
              variant="danger"
              onClick={() => {
                setIsEditing(false);
                reset();
              }}
              // disabled={isMutating}
            >
              Cancel
            </Button>
          )}
        </div>
      </Card.Footer>
    </Card>
  );
}
