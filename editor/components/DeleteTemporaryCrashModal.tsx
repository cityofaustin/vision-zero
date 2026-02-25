"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import { useAuth0 } from "@auth0/auth0-react";
import { Crash } from "@/types/crashes";
import { Recommendation } from "@/types/recommendation";
import {
  CRASH_TRANSFER_SEARCH,
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

/** Display labels for card fields (match crashesColumns in configs/crashesColumns.tsx).
 * The keys are the DB column names for Summary, Flags, and Other card fields.
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
};

const CHANGE_LOG_KEYS_TO_IGNORE = ["updated_at", "updated_by", "position"];

/**
 * Returns the set of Summary/Flags/Other field names that have a record of being
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

export type CrashTransferSearchHit = {
  id: number;
  record_locator: string;
  address_display: string | null;
};

interface DeleteTemporaryCrashModalProps {
  show: boolean;
  onHide: () => void;
  crash: Crash;
}

/**
 * Modal shown when deleting a temporary crash. Lets the user transfer notes,
 * recommendation, and diagram to another (non-temp) crash, or skip transfer.
 */
export default function DeleteTemporaryCrashModal({
  show,
  onHide,
  crash,
}: DeleteTemporaryCrashModalProps) {
  const router = useRouter();
  const { user } = useAuth0();

  const [skipTransfer, setSkipTransfer] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [selectedTarget, setSelectedTarget] =
    useState<CrashTransferSearchHit | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const searchPattern = useMemo(
    () => (searchInput.trim().length >= 2 ? `%${searchInput.trim()}%` : null),
    [searchInput]
  );

  const { data: searchResults, isLoading: isSearching } =
    useQuery<CrashTransferSearchHit>({
      query: show && searchPattern ? CRASH_TRANSFER_SEARCH : null,
      variables: {
        searchPattern,
        currentCrashId: crash.id,
      },
      typename: "crashes",
    });

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

  // Fetch target crash fatalities for photo transfer eligibility
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

  const getToken = useGetToken();

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

  const isSubmitting = isDeleting;
  const canDelete = skipTransfer || !!selectedTarget;

  const editedCardFields = useMemo(
    () => getEditedCardFieldsFromChangeLogs(crash.change_logs, crash.id),
    [crash.change_logs, crash.id]
  );

  const transferItems = useMemo(() => {
    const items: string[] = [];
    if ((crash.crash_notes?.length ?? 0) > 0) {
      items.push(`Notes (${crash.crash_notes!.length})`);
    }
    if (crash.recommendation) {
      items.push("Fatality Review Board recommendations");
    }
    for (const fieldKey of editedCardFields) {
      const label = CARD_FIELD_LABELS[fieldKey] ?? fieldKey;
      items.push(label);
    }
    if (shouldTransferPhoto) {
      items.push("Victim photo");
    }
    return items;
  }, [
    crash.crash_notes,
    crash.recommendation,
    editedCardFields,
    shouldTransferPhoto,
  ]);

  const handleClose = useCallback(() => {
    setSkipTransfer(false);
    setSearchInput("");
    setSelectedTarget(null);
    setShowDropdown(false);
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
      if ((crash.crash_notes?.length ?? 0) > 0) {
        await mutateTransferNotes({
          sourceCrashId: crash.id,
          targetCrashId: targetId,
          updated_by: user.email,
        });
      }

      if (crash.recommendation) {
        const targetRec = targetRecommendation;
        if (targetRec) {
          const tempRec = crash.recommendation as Recommendation;
          const partnerPksToDelete = (
            targetRec.recommendations_partners ?? []
          ).map((p) => p.id);
          const partnersToAdd = (tempRec.recommendations_partners ?? [])
            .filter((p) => p.coordination_partners?.id ?? p.partner_id != null)
            .map((p) => ({
              recommendation_id: targetRec.id,
              partner_id: p.coordination_partners?.id ?? p.partner_id,
            }));
          await mutateUpdateRec(
            {
              id: targetRec.id,
              record: {
                rec_text: tempRec.rec_text,
                rec_update: tempRec.rec_update,
                recommendation_status_id: tempRec.recommendation_status_id,
              },
              partnerPksToDelete,
              partnersToAdd,
            },
            { skip_updated_by_setter: true }
          );
          await mutateDeleteRec({ id: tempRec.id });
        } else {
          await mutateUpdateRec(
            {
              id: crash.recommendation.id,
              record: { crash_pk: targetId },
              partnerPksToDelete: [],
              partnersToAdd: [],
            },
            { skip_updated_by_setter: true }
          );
        }
      }

      const cardUpdates: Record<string, unknown> = {};
      for (const key of editedCardFields) {
        if (key in crash) {
          cardUpdates[key] = crash[key];
        }
      }
      if (Object.keys(cardUpdates).length > 0) {
        await mutateUpdateCrash(
          {
            id: targetId,
            updates: cardUpdates as Record<string, unknown>,
          },
          { skip_updated_by_setter: true }
        );
      }

      // Transfer victim photo via API
      if (shouldTransferPhoto && tempFatalityId && targetFatalityPersonId) {
        const token = await getToken();
        const photoRes = await fetch(
          `${process.env.NEXT_PUBLIC_CR3_API_DOMAIN}/images/person/${tempFatalityId}/transfer/${targetFatalityPersonId}`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!photoRes.ok) {
          const errBody = await photoRes.json().catch(() => null);
          throw new Error(
            errBody?.error ?? `Photo transfer failed (${photoRes.status})`
          );
        }
      }

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
    setSearchInput("");
    setSelectedTarget(null);
    setSkipTransfer(false);
    setSubmitError(null);
  }, [show]);

  const hits = searchResults ?? [];

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

          <Form.Group className="mb-3">
            <Form.Label>Transfer data to crash</Form.Label>
            <div className="position-relative">
              <Form.Control
                type="text"
                placeholder="Search by Crash ID or primary address..."
                value={
                  selectedTarget
                    ? `${selectedTarget.record_locator} – ${selectedTarget.address_display ?? ""}`
                    : searchInput
                }
                onChange={(e) => {
                  setSearchInput(selectedTarget ? "" : e.target.value);
                  if (selectedTarget) setSelectedTarget(null);
                  setShowDropdown(true);
                }}
                onFocus={() => searchInput.length >= 2 && setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                autoComplete="off"
              />
              {isSearching && (
                <Spinner
                  size="sm"
                  className="position-absolute top-50 end-0 translate-middle-y me-2"
                  style={{ position: "absolute" }}
                />
              )}
              {showDropdown && searchPattern && !selectedTarget && (
                <ul
                  className="list-group position-absolute w-100 mt-1 shadow-sm"
                  style={{
                    zIndex: 1050,
                    maxHeight: "240px",
                    overflowY: "auto",
                  }}
                >
                  {hits.length === 0 && !isSearching && (
                    <li className="list-group-item text-muted">
                      No crashes found
                    </li>
                  )}
                  {hits.map((hit) => (
                    <li
                      key={hit.id}
                      className="list-group-item list-group-item-action"
                      role="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSelectedTarget(hit);
                        setSearchInput("");
                        setShowDropdown(false);
                      }}
                    >
                      <strong>{hit.record_locator}</strong>
                      {hit.address_display && (
                        <span className="text-muted ms-2">
                          {hit.address_display}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Form.Group>

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
              if (checked) {
                // Clear the transfer target when toggle is turned on
                setSearchInput("");
                setSelectedTarget(null);
                setShowDropdown(false);
              }
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
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            type="submit"
            disabled={!canDelete || isSubmitting}
          >
            {isSubmitting ? (
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
