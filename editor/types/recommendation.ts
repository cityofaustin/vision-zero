/**
 * A crash recommendation object for the fatality review board
 * recommendation component
 */
export type Recommendation = {
  id: number;
  created_at: string;
  created_by: string;
  crash_pk: number;
  rec_text: string | null;
  rec_update: string | null;
  recommendation_status_id: number | null;
  atd__recommendation_status_lkp: RecommendationStatus | null;
  recommendations_partners: RecommendationPartner[] | null;
};

/**
 * Recomendation status lookup item
 */
export type RecommendationStatus = {
  id: number;
  rec_status_desc: string;
  sort_order: number;
};

/**
 * A recommendation partner object which enables the
 * many to many relationship between recommendations and
 * recommendation partners
 */
export type RecommendationPartner = {
  id: number;
  partner_id: number | null;
  recommendation_id: number | null;
  coordination_partners: CoordinationPartner | null;
};

/**
 * A coordination partner lookup item
 */
export type CoordinationPartner = {
  id: number;
  label: string;
  source: string;
};

/**
 * A partial recommendation type which is more flexible
 * so that it can be used with edit components
 */
export type RecommendationFormInputs = {
  id?: number | undefined;
  created_at?: string | undefined;
  created_by?: string | undefined;
  crash_pk?: number | undefined;
  rec_text?: string | null | undefined;
  rec_update?: string | null | undefined;
  recommendation_status_id?: number | null | undefined;
  recommendations_partners?:
    | Partial<RecommendationPartner>[]
    | null
    | undefined;
};
