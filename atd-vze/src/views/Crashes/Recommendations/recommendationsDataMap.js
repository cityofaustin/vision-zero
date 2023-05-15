export const recommendationsDataMap = {
  title: "Fatality Review Board Recommendations",

  fields: {
    coordination_partner_id: {
      label: "Coordination Partner:",
      lookupOptions: "atd__coordination_partners_lkp",
      key: "coord_partner_desc",
    },
    recommendation_status_id: {
      label: "Status:",
      lookupOptions: "atd__recommendation_status_lkp",
      key: "rec_status_desc",
    },
    rec_text: {
      label: "Recommendation",
      key: "rec_text",
    },
    rec_update: {
      label: "Updates",
      key: "rec_update",
    },
    partner_id: {
      label: "Coordination Partner:",
      lookupOptions: "atd__coordination_partners_lkp",
      key: "coord_partner_desc",
    },
  },
};
