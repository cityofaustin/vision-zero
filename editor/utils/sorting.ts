/**
 * Function which compares values as strings, sorting nulls last
 */
export const compareStrings = (value1: unknown, value2: unknown): number => {
  if (value1 === value2) {
    return 0;
  }
  // nulls sort after anything else
  if (value1 === null) {
    return 1;
  }
  if (value2 === null) {
    return -1;
  }
  // sort ascending
  return String(value2) < String(value1) ? 1 : -1;
};

/**
 * Function which compares values as numbers, sorting nulls last. This works
 * with boolean values as well because Number(true) = 1.
 */
export const compareNumbersAndBools = (value1: unknown, value2: unknown): number => {
  if (value1 === value2) {
    return 0;
  }
  // nulls sort after anything else
  if (value1 === null) {
    return 1;
  }
  if (value2 === null) {
    return -1;
  }
  // sort ascending
  return Number(value2) < Number(value1) ? 1 : -1;
};
