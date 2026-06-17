export const CRASH_TYPES = {
  fatalitiesAndSeriousInjuries: {
    name: "fatalitiesAndSeriousInjuries",
    textString: "Fatalities and Serious Injuries",
    queryStringCrash: "(death_cnt > 0 OR sus_serious_injry_cnt > 0)",
    queryStringPerson: "(prsn_injry_sev_id = 4 OR prsn_injry_sev_id = 1)",
  },
  fatalities: {
    name: "fatalities",
    textString: "Fatalities",
    queryStringCrash: "(death_cnt > 0)",
    queryStringPerson: "(prsn_injry_sev_id = 4)",
  },
  seriousInjuries: {
    name: "seriousInjuries",
    textString: "Serious Injuries",
    queryStringCrash: "(sus_serious_injry_cnt > 0)",
    queryStringPerson: "(prsn_injry_sev_id = 1)",
  },
};
