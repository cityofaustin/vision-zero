/**
 * Exports the logic needed for the Austin Full Purpose map
 * @type {object}
 */
export const crashesFullPurpose = {
  _and: `_or: [
              { austin_full_purpose: { _eq: "Y"} }
              { city_id: { _eq: 22 }, position: { _is_null: true} }
  ]`
};
