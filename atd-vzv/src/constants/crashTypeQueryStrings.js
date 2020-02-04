// Fatalities and serious injuries crash type selector query strings
export const fatalities = "apd_confirmed_death_count > 0"
export const seriousInjuries = "sus_serious_injry_cnt > 0"
export const fatalitiesAndSeriousInjuries = "(apd_confirmed_death_count > 0 OR sus_serious_injry_cnt > 0)"