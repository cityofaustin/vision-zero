/**
 * Type which describes the crash_risk_factors_view database view
 * which has an object relationship to crashes
 */
export type CrashRiskFactors = {
  id?: number;
  risk_factors?: string[] | null;
};
