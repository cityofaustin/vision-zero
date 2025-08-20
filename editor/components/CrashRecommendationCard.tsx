import { useState, useCallback, useMemo, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@/utils/graphql";
import CrashRecommendationPartners from "./CrashRecommendationPartners";
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
import PermissionsRequired from "@/components/PermissionsRequired";

const allowedRecommendationEditRoles = ["vz-admin", "editor"];

/**
 * Compares the old vs new RecommendationPartner arrays and returns
 * new arrays of partner data that can be used in graphql mutation
 * @param recommendationId - the pk of the current recommendation, if we are editing
 * @param partnersOld - array of RecommendationPartner[] objs
 * @param partnersNew - array of RecommendationPartner's from the form data. it is
 * expected that these objects may only have a `partner_id` property
 * @returns [partnersToAdd, partnerPksToDelete]
 */
const getPartnerChanges = (
  recommendationId: number | null,
  partnersOld: Partial<RecommendationPartner>[],
  partnersNew: Partial<RecommendationPartner>[]
) => {
  const partnersToAdd: Partial<RecommendationPartner>[] = [];
  const partnerPksToDelete: number[] = [];

  if (partnersOld.length > 0) {
    // check if any partners have been removed
    partnersOld.forEach((partnerOld) => {
      if (
        !partnersNew.find(
          (partnerNew) => partnerNew.partner_id === partnerOld.partner_id
        )
      ) {
        // delete this partner - so grab it's PK
        partnerPksToDelete.push(partnerOld.id!);
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
        partnersToAdd.push({
          partner_id: partnerNew.partner_id,
          ...(recommendationId && {
            recommendation_id: recommendationId,
          }),
        });
      }
    });
  }
  return [partnersToAdd, partnerPksToDelete];
};

interface CrashRecommendationCardProps {
  recommendation: Recommendation | null;
  crash_pk: number;
  onSaveCallback: () => Promise<void>;
}

/**
 * UI component for viewing and editing fatalitiy review
 * board (FRB) recommendations
 */
export default function CrashRecommendationCard({
  recommendation,
  crash_pk,
  onSaveCallback,
}: CrashRecommendationCardProps) {
  const { user } = useAuth0();
  const [isEditing, setIsEditing] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
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

  const defaultValues = useMemo(() => {
    return recommendation
      ? {
          rec_text: recommendation.rec_text,
          rec_update: recommendation.rec_update,
          recommendation_status_id: recommendation.recommendation_status_id,
          crash_pk: recommendation.crash_pk,
          recommendations_partners:
            recommendation.recommendations_partners || [],
        }
      : {
          rec_text: null,
          rec_update: null,
          recommendation_status_id: null,
          crash_pk,
          created_by: user?.email,
          recommendations_partners: [],
        };
  }, [recommendation, crash_pk, user]);


  const {
    register,
    reset,
    handleSubmit,
    formState: { isDirty },
    setValue,
    watch,
  } = useForm<RecommendationFormInputs>({
    defaultValues,
  });

  /**
   * Reset the form values after the recommendation is saved
   */
  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const { mutate } = useMutation(
    recommendation
      ? UPDATE_RECOMMENDATION_MUTATION
      : INSERT_RECOMMENDATION_MUTATION
  );

  const onSave = useCallback(
    async (data: RecommendationFormInputs) => {
      setIsMutating(true);
      // just use a generic object to make the data structuring easier
      const payload: Record<string, unknown> = data;

      const [partnersToAdd, partnerPksToDelete] = getPartnerChanges(
        recommendation?.id || null,
        recommendation?.recommendations_partners || [],
        data.recommendations_partners || []
      );

      let variables;
      if (recommendation) {
        delete payload.recommendations_partners;
        variables = {
          record: payload,
          id: recommendation?.id,
          partnersToAdd,
          partnerPksToDelete,
        };
      } else {
        payload.recommendations_partners = { data: partnersToAdd };
        variables = { record: payload };
      }
      await mutate(variables, { skip_updated_by_setter: true });
      await onSaveCallback();
      setIsMutating(false);
      setIsEditing(false);
    },
    [recommendation, mutate, onSaveCallback, setIsMutating, setIsEditing]
  );

  return (
    <Card>
      <Card.Header>
        <Card.Title>Fatality Review Board recommendations</Card.Title>
      </Card.Header>
      <Card.Body>
        <Form id="recommendationForm" onSubmit={handleSubmit(onSave)}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Partners</Form.Label>
            {!isEditing && (
              <p>
                {recommendation?.recommendations_partners
                  ?.map(
                    (rec_partner) => rec_partner.coordination_partners?.label
                  )
                  .join(", ") || "-"}
              </p>
            )}
            {isEditing && isLoadingPartners && <Spinner size="sm" />}
            {isEditing && partners && (
              <div style={{ height: "200px", overflowY: "auto" }}>
                <CrashRecommendationPartners
                  setValue={setValue}
                  watch={watch}
                  partners={partners}
                />
              </div>
            )}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Status</Form.Label>
            {isEditing && !isLoadingStatuses && statuses && (
              <Form.Select
                {...register("recommendation_status_id", {
                  // coerce to number or null
                  setValueAs: (v) => Number(v) || null,
                })}
              >
                <option value="">Select status...</option>
                {statuses.map((option) => (
                  <option key={option.id} value={String(option.id)}>
                    {option.rec_status_desc || "-"}
                  </option>
                ))}
              </Form.Select>
            )}
            {isEditing && isLoadingStatuses && <Spinner size="sm" />}
            {!isEditing && (
              <p>
                {recommendation?.atd__recommendation_status_lkp
                  ?.rec_status_desc || "-"}
              </p>
            )}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Recommendation</Form.Label>
            {isEditing && (
              <Form.Control
                {...register("rec_text", {
                  // coerce empty fields to null
                  setValueAs: (v) => v?.trim() || null,
                })}
                as="textarea"
                rows={6}
                autoFocus={true}
              />
            )}
            {!isEditing && (
              <p style={{ whiteSpace: "pre-wrap" }}>
                {recommendation?.rec_text || "-"}
              </p>
            )}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Updates</Form.Label>
            {isEditing && (
              <Form.Control
                {...register("rec_update", {
                  // coerce empty fields to null
                  setValueAs: (v) => v?.trim() || null,
                })}
                as="textarea"
                rows={6}
              />
            )}
            {!isEditing && (
              <p style={{ whiteSpace: "pre-wrap" }}>
                {recommendation?.rec_update || "-"}
              </p>
            )}
          </Form.Group>
        </Form>
      </Card.Body>
      <PermissionsRequired allowedRoles={allowedRecommendationEditRoles}>
        <Card.Footer>
          <div className="d-flex justify-content-end">
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
            {isEditing && (
              <Button
                size="sm"
                variant="primary"
                disabled={!isDirty || isMutating}
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
                variant="secondary"
                onClick={() => {
                  setIsEditing(false);
                  reset();
                }}
                disabled={isMutating}
              >
                Cancel
              </Button>
            )}
          </div>
        </Card.Footer>
      </PermissionsRequired>
    </Card>
  );
}
