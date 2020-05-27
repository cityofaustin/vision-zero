import React from "react";

export const popoverConfig = {
  summary: {
    yearsOfLifeLost: {
      title: "Years of Life Lost",
      html: (
        <>
          <div className="mb-2">
            Years of Life Lost is an estimate of the number of additional years
            a person would have lived if they had not died prematurely. For this
            calculation we assume an average life expectancy of 75 years. For
            example, a 25 year old person killed in a crash would represent 50
            years of life lost.
          </div>
        </>
      ),
    },
    raceEthnicity: {
      title: "Race/Ethnicity",
      html: (
        <>
          <div className="mb-2">
            This visualization relies on information entered by officers into
            the "Ethnicity" field within official crash reports. To more
            accurately reflect modern race and ethnicity data standards, the
            label for this visualization has been modified to "Race/Ethnicity."
          </div>
        </>
      ),
    },
  },
  map: {
    trafficCrashes: {
      title: "Traffic Crashes",
      html: (
        <>
          <div className="mb-2">
            Crash data is obtained from the Texas Department of Transportation
            (TXDOT) Crash Record Information System (CRIS) database, which is
            populated by reports submitted by Texas Peace Officers throughout
            the state, including Austin Police Department (APD), and maintained
            by TXDOT.
          </div>
          <div className="mb-2">
            These reports are typically written when there is at least $1000
            worth of property damage or any level of injury. For additional
            reference, see{" "}
            <a
              href="https://ftp.dot.state.tx.us/pub/txdot-info/trf/crash_notifications/2018/crash-report-100.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              Form CR-3 Instruction Manual
            </a>
            .
          </div>
          <div className="mb-2">
            Crash data included in Vision Zero Viewer includes crashes within
            City of Austin geographic boundaries, inclusive of all public safety
            jurisdictions. This data may differ from APD data in that it
            includes crashes for which APD officers did not respond.
          </div>
          <div className="mb-2">
            Crash data in Vision Zero Viewer is updated monthly. Vision Zero
            Viewer intentionally delays updates by a month to allow for updates
            from the CRIS database for quality assurance and may update without
            notice. Potential reasons for a crash record to be updated may
            include completion of crash investigations, someone passing within
            30 days of sustaining injuries from a crash, and more.
          </div>
          <div className="mb-2">
            Most crashes are mapped in Vision Zero Viewer based on the
            latitudes/longitudes reported in the CRIS database. In some cases,
            the City of Austin has updated the locations based on manual
            verification of the information included in the officer’s crash
            report.
          </div>
          <div className="mb-2">
            Please note that the data and information on this website is for
            informational purposes only. While we seek to provide accurate
            information, please note that errors may be present and information
            presented may not be complete. For official inquiries on City of
            Austin crash data, contact **email address**.
          </div>
        </>
      ),
    },
    overlays: {
      title: "Overlays",
      html: (
        <>
          <div className="font-weight-bold">ASMP Street Levels</div>
          <div className="mb-2">
            The Austin Strategic Mobility Plan (ASMP) is Austin’s new city-wide
            transportation plan that was adopted in 2019. The street levels map
            overlay includes roads that are within the jurisdictional boundaries
            of the City of Austin and is used to identify right of way
            dedication requirements needed to accommodate future roadway
            conditions. These future roadway conditions are reflective of the
            recommended improvements in the ASMP. For more information, visit{" "}
            <a
              href="https://www.austintexas.gov/department/austin-strategic-mobility-plan"
              target="_blank"
              rel="noopener noreferrer"
            >
              Austin Strategic Mobility Plan
            </a>
            .
          </div>
          <div className="font-weight-bold">High Injury Network</div>
          <div className="mb-2">
            This is an online version of the Combined High-Injury Network Map
            included in the adopted Austin Strategic Mobility Plan policy
            document. A detailed crash analysis of crashes from 2013 to 2017 was
            used to identify the Combined High-Injury Network, which includes
            just 8% of the city’s street network but contains nearly 70% of all
            serious injury or fatal crashes for all modes. For more information,
            visit{" "}
            <a
              href="https://www.austintexas.gov/department/austin-strategic-mobility-plan"
              target="_blank"
              rel="noopener noreferrer"
            >
              Austin Strategic Mobility Plan
            </a>
            .
          </div>
        </>
      ),
    },
  },
};
