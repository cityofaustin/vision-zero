
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

export type RecommendationStatus = {
  id: number;
  rec_status_desc: string;
};

type RecommendationPartner = {
  id: number;
  partner_id: number | null;
  recommendation_id: number | null;
  atd__coordination_partners_lkp: CoordinationPartner | null;
};

type CoordinationPartner = {
  id: number;
  coord_partner_desc: string;
};
