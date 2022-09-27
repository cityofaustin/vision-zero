export const recommendationsDataMap = {
  title: "Fatality Review Board Recommendations",

  fields: {
    coordination_partner_id: {
      label: "Coordination Partner:",
      lookupOptions: "atd__coordination_partners_lkp",
      key: "description",
    },
    recommendation_status_id: {
      label: "Status:",
      lookupOptions: "atd__recommendation_status_lkp",
      key: "description",
    },
    text: {
      label: "Recommendation",
      key: "text",
    },
    update: {
      label: "Updates",
      key: "update",
    },
    partner_id: {
      label: "Coordination Partner:",
      lookupOptions: "atd__coordination_partners_lkp",
      key: "description",
    },
  },
};
