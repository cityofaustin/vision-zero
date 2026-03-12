import { Crash } from "@/types/crashes";
import { Recommendation } from "@/types/recommendation";

type MutateFn = (
  variables: Record<string, unknown>,
  options?: { skip_updated_by_setter?: boolean }
) => Promise<unknown>;

interface TargetRecommendation {
  id: number;
  recommendations_partners: { id: number; partner_id: number | null }[];
}

export interface TransferConfig {
  crash: Crash;
  targetCrashId: number;
  editedCardFields: Set<keyof Crash>;
  targetRecommendation: TargetRecommendation | null;
  photo: {
    shouldTransfer: boolean;
    sourcePersonId: number | null;
    targetPersonId: number | null;
  };
  userEmail: string;
  getToken: () => Promise<string | undefined>;
  mutations: {
    transferNotes: MutateFn;
    updateCrash: MutateFn;
    updateRecommendation: MutateFn;
    deleteRecommendation: MutateFn;
  };
}

/**
 * Execute all data transfers from a temporary crash to a target crash.
 * Each step is independently conditional — only runs if there is data to transfer.
 */
export async function executeTransfer(config: TransferConfig): Promise<void> {
  const {
    crash,
    targetCrashId,
    editedCardFields,
    targetRecommendation,
    photo,
    userEmail,
    getToken,
    mutations,
  } = config;

  if ((crash.crash_notes?.length ?? 0) > 0) {
    await mutations.transferNotes({
      sourceCrashId: crash.id,
      targetCrashId,
      updated_by: userEmail,
    });
  }

  if (crash.recommendation) {
    await transferRecommendation(
      crash.recommendation as Recommendation,
      targetCrashId,
      targetRecommendation,
      userEmail,
      mutations.updateRecommendation,
      mutations.deleteRecommendation
    );
  }

  const cardUpdates: Record<string, unknown> = {};
  for (const key of editedCardFields) {
    if (key in crash && crash[key] != null && crash[key] !== "") {
      cardUpdates[key] = crash[key];
    }
  }
  if (Object.keys(cardUpdates).length > 0) {
    await mutations.updateCrash({ id: targetCrashId, updates: cardUpdates });
  }

  if (photo.shouldTransfer && photo.sourcePersonId && photo.targetPersonId) {
    const token = await getToken();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_CR3_API_DOMAIN}/images/person/${photo.sourcePersonId}/copy/${photo.targetPersonId}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!res.ok) {
      const errBody = await res.json().catch(() => null);
      throw new Error(
        errBody?.error ?? `Photo transfer failed (${res.status})`
      );
    }
  }
}

/**
 * Transfer a recommendation from the temp crash to the target crash.
 * If the target already has a recommendation, overwrite it and delete the source.
 * Otherwise, re-point the source recommendation to the target crash.
 */
async function transferRecommendation(
  sourceRec: Recommendation,
  targetCrashId: number,
  targetRec: TargetRecommendation | null,
  userEmail: string,
  updateRec: MutateFn,
  deleteRec: MutateFn
): Promise<void> {
  if (targetRec) {
    const existingPartnerIds = new Set(
      (targetRec.recommendations_partners ?? [])
        .map((p) => p.partner_id)
        .filter((id): id is number => id != null)
    );
    const partnersToAdd = (sourceRec.recommendations_partners ?? [])
      .map((p) => p.coordination_partners?.id ?? p.partner_id)
      .filter((id): id is number => id != null)
      .filter((id) => !existingPartnerIds.has(id))
      .map((partner_id) => ({
        recommendation_id: targetRec.id,
        partner_id,
      }));
    await updateRec({
      id: targetRec.id,
      record: {
        rec_text: sourceRec.rec_text,
        rec_update: sourceRec.rec_update,
        recommendation_status_id: sourceRec.recommendation_status_id,
      },
      partnerPksToDelete: [],
      partnersToAdd,
    });
    await deleteRec({ id: sourceRec.id });
  } else {
    await updateRec({
      id: sourceRec.id,
      record: { crash_pk: targetCrashId },
      partnerPksToDelete: [],
      partnersToAdd: [],
    });
  }
}
