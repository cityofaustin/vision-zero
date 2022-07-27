export const recommendationsDataMap = [
    {
      title: "Fatality Review Board Recommendations",
  
      fields: {
        coordination_partner_id: {
          label: "Coordination Partner: ",
          lookupOptions: "atd__coordination_partners_lkp",
        },
        recommendation_status_id: {
          label: "Status: ",
          lookupOptions: "atd__recommendation_status_lkp"
        },
        text: {
          label: "Note",
        },
      },
    },
  ];
  