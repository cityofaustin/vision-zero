import { Recommendation } from "./recommendation";

export type fatalitiesListRow = {
  year: number;
  record_locator: string;
  case_id: string | null;
  law_enforcement_ytd_fatality_num: number | null;
  ytd_fatal_crash: number;
  ytd_fatality: number;
  crash_date_ct: string;
  location: string | null;
  victim_name: string | null;
  recommendation: Recommendation | null;
};
