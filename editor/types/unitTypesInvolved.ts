/**
 * Type which describes the unit_types_involved_view database view which has an object
 * relationship to crashes
 */
export type UnitTypesInvolved = {
  crash_pk?: number;
  unit_types_involved?: string | null;
};
 