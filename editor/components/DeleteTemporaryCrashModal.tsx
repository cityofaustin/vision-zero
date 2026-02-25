"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import { useAuth0 } from "@auth0/auth0-react";
import { Crash } from "@/types/crashes";
import {
  DELETE_CRIS_CRASH,
  GET_CRASH_RECOMMENDATION_BY_ID,
  GET_TARGET_CRASH_FATALITY,
  UPDATE_CRASH,
} from "@/queries/crash";
import {
  DELETE_RECOMMENDATION_MUTATION,
  UPDATE_RECOMMENDATION_MUTATION,
} from "@/queries/recommendations";
import { TRANSFER_CRASH_NOTES } from "@/queries/crashNotes";
import { useQuery, useMutation } from "@/utils/graphql";
import { useGetToken } from "@/utils/auth";
import CrashSearchTypeahead, {
  CrashSearchHit,
} from "./CrashSearchTypeahead";
import { executeTransfer } from "@/utils/transferTempCrash";

/** Display labels for card fields.
 * The keys are the DB column names for transferable fields.
 */
const CARD_FIELD_LABELS: Record<string, string> = {
  case_id: "Case ID",
  crash_timestamp: "Crash date",
  fhe_collsn_id: "Collision type",
  rpt_city_id: "City",
  private_dr_fl: "Private drive",
  at_intrsct_fl: "At intersection",
  active_school_zone_fl: "Active school zone",
  onsys_fl: "On TxDOT highway system",
  rr_relat_fl: "Railroad related",
  road_constr_zone_fl: "Road construction zone",
  schl_bus_fl: "School bus",
  toll_road_fl: "Toll road/lane",
  light_cond_id: "Light condition",
  crash_speed_limit: "Speed limit",
  obj_struck_id: "Object struck",
  law_enforcement_ytd_fatality_num: "Law Enforcement YTD Fatal Crash",
  latitude: "Crash location",
  longitude: "Crash location",
};

const CHANGE_LOG_KEYS_TO_IGNORE = ["updated_at", "updated_by", "position"];

/**
 * Returns the set of field names that have a record of being
 * edited on this crash (from change logs where record_type === 'crash').
 */
function getEditedCardFieldsFromChangeLogs(
  changeLogs: Crash["change_logs"],
  crashId: number
): Set<keyof Crash> {
  const edited = new Set<string>();
  if (!changeLogs?.length) return new Set() as Set<keyof Crash>;

  for (const log of changeLogs) {
    if (log.record_type !== "crash" || log.record_id !== crashId) continue;
    const { old: oldVal, new: newVal } = log.record_json;
    if (!newVal) continue;
    for (const key of Object.keys(newVal)) {
      if (CHANGE_LOG_KEYS_TO_IGNORE.includes(key)) continue;
      if (oldVal?.[key] !== newVal[key]) {
        edited.add(key);
      }
    }
  }

  const allowedSet = new Set(Object.keys(CARD_FIELD_LABELS));
  return new Set(
    [...edited].filter((k) => allowedSet.has(k as keyof Crash))
  ) as Set<keyof Crash>;
}

/**
 * Build the human-readable list of items that will be transferred.
 * Deduplicates labels (e.g. latitude + longitude both map to "Crash location").
 */
function buildTransferItemsList(
  crash: Crash,
  editedCardFields: Set<keyof Crash>,
  shouldTransferPhoto: boolean
): string[] {
  const items: string[] = [];

  if ((crash.crash_notes?.length ?? 0) > 0) {
    items.push(`Notes (${crash.crash_notes!.length})`);
  }
  if (crash.recommendation) {
    items.push("Fatality Review Board recommendations");
  }

  const seen = new Set<string>();
  for (const fieldKey of editedCardFields) {
    const label = CARD_FIELD_LABELS[fieldKey] ?? fieldKey;
    if (!seen.has(label)) {
      seen.add(label);
      items.push(label);
    }
  }

  if (shouldTransferPhoto) {
    items.push("Victim photo");
  }
  return items;
}

interface DeleteTemporaryCrashModalProps {
  show: boolean;
  onHide: () => void;
  crash: Crash;
}

/**
 * Modal shown when deleting a temporary crash. Lets the user transfer updated fields
 * and victim photo to another (non-temp) crash, or skip transfer.
 */
export default function DeleteTemporaryCrashModal({
  show,
  onHide,
  crash,
}: DeleteTemporaryCrashModalProps) {
  const router = useRouter();
  const { user } = useAuth0();
  const getToken = useGetToken();

  const [skipTransfer, setSkipTransfer] = useState(false);
  const [selectedTarget, setSelectedTarget] =
    useState<CrashSearchHit | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // --- Target crash data ---

  const { data: targetCrashData } = useQuery<{
    id: number;
    record_locator: string;
    recommendation: {
      id: number;
      recommendations_partners: { id: number; partner_id: number | null }[];
    } | null;
  }>({
    query: show && selectedTarget ? GET_CRASH_RECOMMENDATION_BY_ID : null,
    variables: { id: selectedTarget?.id ?? 0 },
    typename: "crashes",
  });
  const targetRecommendation = targetCrashData?.[0]?.recommendation ?? null;

  const { data: targetFatalityData } = useQuery<{
    id: number;
    people_list_view: { id: number; prsn_injry_sev_id: number | null }[];
  }>({
    query: show && selectedTarget ? GET_TARGET_CRASH_FATALITY : null,
    variables: { id: selectedTarget?.id ?? 0 },
    typename: "crashes",
  });
  const targetFatalities = targetFatalityData?.[0]?.people_list_view ?? [];
  const targetFatalityPersonId =
    targetFatalities.length === 1 ? targetFatalities[0].id : null;

  // --- Temp crash photo detection ---

  // Temp crash fatalities (fatal injury severity = 4)
  const tempFatalities = useMemo(
    () =>
      crash.people_list_view?.filter((p) => p.prsn_injry_sev_id === 4) ?? [],
    [crash.people_list_view]
  );
  const tempFatalityId =
    tempFatalities.length > 0 ? tempFatalities[0].id : null;

  // Detect photo existence via the API (same path the fatalities page uses)
  const [hasPhotoToTransfer, setHasPhotoToTransfer] = useState(false);
  useEffect(() => {
    if (!show || !tempFatalityId) {
      setHasPhotoToTransfer(false);
      return;
    }
    let cancelled = false;
    const checkPhoto = async () => {
      try {
        const token = await getToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_CR3_API_DOMAIN}/images/person/${tempFatalityId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!cancelled) setHasPhotoToTransfer(res.ok);
      } catch {
        if (!cancelled) setHasPhotoToTransfer(false);
      }
    };
    checkPhoto();
    return () => {
      cancelled = true;
    };
  }, [show, tempFatalityId, getToken]);

  const shouldTransferPhoto =
    !!selectedTarget &&
    tempFatalities.length > 0 &&
    targetFatalities.length === 1 &&
    hasPhotoToTransfer;

  // --- Mutations ---

  const { mutate: mutateDeleteCrash, loading: isDeleting } =
    useMutation(DELETE_CRIS_CRASH);
  const { mutate: mutateTransferNotes } = useMutation(TRANSFER_CRASH_NOTES);
  const { mutate: mutateUpdateCrash } = useMutation(UPDATE_CRASH);
  const { mutate: mutateUpdateRec } = useMutation(
    UPDATE_RECOMMENDATION_MUTATION
  );
  const { mutate: mutateDeleteRec } = useMutation(
    DELETE_RECOMMENDATION_MUTATION
  );

  // --- Derived state ---

  const canDelete = skipTransfer || !!selectedTarget;

  const editedCardFields = useMemo(
    () => getEditedCardFieldsFromChangeLogs(crash.change_logs, crash.id),
    [crash.change_logs, crash.id]
  );

  const transferItems = useMemo(
    () => buildTransferItemsList(crash, editedCardFields, shouldTransferPhoto),
    [crash, editedCardFields, shouldTransferPhoto]
  );

  // --- Handlers ---

  const handleClose = useCallback(() => {
    setSkipTransfer(false);
    setSelectedTarget(null);
    setSubmitError(null);
    onHide();
  }, [onHide]);

  const runTransferThenDelete = useCallback(async () => {
    if (!user?.email) return;
    const targetId = selectedTarget?.id;
    const targetRecordLocator = selectedTarget?.record_locator;

    if (!targetId || !targetRecordLocator) {
      await mutateDeleteCrash({ id: crash.id, updated_by: user.email });
      handleClose();
      router.push("/crashes");
      return;
    }

    setSubmitError(null);
    try {
      await executeTransfer({
        crash,
        targetCrashId: targetId,
        editedCardFields,
        targetRecommendation,
        photo: {
          shouldTransfer: shouldTransferPhoto,
          sourcePersonId: tempFatalityId,
          targetPersonId: targetFatalityPersonId,
        },
        userEmail: user.email,
        getToken,
        mutations: {
          transferNotes: mutateTransferNotes,
          updateCrash: mutateUpdateCrash,
          updateRecommendation: mutateUpdateRec,
          deleteRecommendation: mutateDeleteRec,
        },
      });

      await mutateDeleteCrash({ id: crash.id, updated_by: user.email });
      handleClose();
      router.push(`/crashes/${targetRecordLocator}`);
    } catch (err) {
      console.error("Transfer/delete failed:", err);
      setSubmitError(
        err instanceof Error ? err.message : "Transfer or delete failed."
      );
    }
  }, [
    crash,
    editedCardFields,
    selectedTarget,
    targetRecommendation,
    user?.email,
    shouldTransferPhoto,
    tempFatalityId,
    targetFatalityPersonId,
    getToken,
    mutateDeleteCrash,
    mutateTransferNotes,
    mutateUpdateCrash,
    mutateUpdateRec,
    mutateDeleteRec,
    handleClose,
    router,
  ]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canDelete) return;
      await runTransferThenDelete();
    },
    [canDelete, runTransferThenDelete]
  );

  useEffect(() => {
    if (!show) return;
    setSelectedTarget(null);
    setSkipTransfer(false);
    setSubmitError(null);
  }, [show]);

  // --- Render ---

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Delete temporary crash record</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <p className="text-muted">
            Transfer data to another crash so updated fields are preserved, or
            choose to delete without transferring any data.
          </p>

          <CrashSearchTypeahead
            excludeCrashId={crash.id}
            selected={selectedTarget}
            onSelect={setSelectedTarget}
            disabled={!show || skipTransfer}
          />

          {selectedTarget && transferItems.length > 0 && (
            <div className="mb-3 p-2 bg-light rounded">
              <strong>The following will be transferred:</strong>
              <ul className="mb-0 mt-1">
                {transferItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <Form.Check
            type="switch"
            id="skip-transfer"
            label="I don't want to transfer data"
            checked={skipTransfer}
            onChange={(e) => {
              const checked = e.target.checked;
              setSkipTransfer(checked);
              if (checked) setSelectedTarget(null);
            }}
            className="mb-3"
          />

          {submitError && (
            <div className="alert alert-danger py-2" role="alert">
              {submitError}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            type="submit"
            disabled={!canDelete || isDeleting}
          >
            {isDeleting ? (
              <>
                <Spinner size="sm" className="me-2" />
                Deleting…
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
