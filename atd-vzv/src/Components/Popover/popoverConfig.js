import React from "react";
import raceEthnicityTable2018 from "./raceEthnicityTable2018.png";
import byYearTable from "./byYearTable.png";

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
            years of life lost. The total number represented here reflects all
            of the years that loved ones in our community have lost due to car
            crashes this year.
          </div>
        </>
      ),
    },
    demographics: {
      title: "Demographics Data",
      html: (
        <>
          <div className="font-weight-bold">Demographics Data</div>
          <div className="mb-2">
            To compare crash demographics data with historical and estimated
            demographics data for the City of Austin geographic boundaries,
            visit the US Census Bureau's latest{" "}
            <a
              href="https://data.census.gov/cedsci/table?g=1600000US4805000&tid=ACSDP5Y2018.DP05&t=Hispanic%20or%20Latino&layer=VT_2018_160_00_PY_D1&hidePreview=true&moe=false"
              target="_blank"
              rel="noopener noreferrer"
            >
              demographics estimates
            </a>
            .
          </div>
          <div className="font-weight-bold">Gender</div>
          <div className="mb-2">
            This visualization relies on the information entered by officers
            into the official crash reports. Officers are encouraged to use the
            gender that appears on the Driver License/ID Card.
          </div>
          <div className="font-weight-bold">Race/Ethnicity</div>
          <div className="mb-2">
            This visualization relies on information entered by officers into
            the "Ethnicity" field within official crash reports. To more
            accurately reflect modern race and ethnicity data standards, the
            label for this visualization has been modified to "Race/Ethnicity."
            Below is a table showing the estimated population by race/ethnicity
            for Austin in 2018.
            <div>
              <img
                className="mt-2 img-fluid"
                src={raceEthnicityTable2018}
                alt="Table showing the estimated population by race/ethnicity for Austin in 2018"
              />
              <div className="mt-2">
                Source:{" "}
                <a
                  href="https://data.census.gov/cedsci/table?g=1600000US4805000&tid=ACSDP5Y2018.DP05&t=Hispanic%20or%20Latino&layer=VT_2018_160_00_PY_D1&hidePreview=true&moe=false"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  US Census Bureau 2018 ACS 5-Year Estimate
                </a>
              </div>
            </div>
          </div>
        </>
      ),
    },
    byYear: {
      title: "Austin Area Population Histories & Forecasts",
      html: (
        <>
          <div className="font-weight-bold">
            Austin Area Population Histories & Forecasts
          </div>
          <div className="mb-2">
            Below is a table showing how Austin's population continues to
            increase each year. In future versions of the Vision Zero Viewer,
            there will be a visualization showing crash numbers per 100,000
            residents.
            <div>
              <img
                className="mt-2 img-fluid"
                src={byYearTable}
                alt="Table showing how Austin's population continues to increase each year"
              />
              <div className="mt-2">
                Source:{" "}
                <a
                  href="https://www.austintexas.gov/sites/default/files/files/Planning/Demographics/austin_forecast_2019_pub.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ryan Robinson, City Demographer, Department of Planning, City
                  of Austin. November 2018
                </a>
                .
              </div>
            </div>
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
            includes crashes to which APD officers did not respond.
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
            Austin crash data, contact{" "}
            <a
              href="mailto:visionzero@austintexas.gov"
              target="_blank"
              rel="noopener noreferrer"
            >
              VisionZero@AustinTexas.gov
            </a>
            .
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
            The Austin Strategic Mobility Plan (ASMP) is Austin’s current
            long-term, citywide transportation plan that was adopted in 2019.
            The ASMP includes a map defining all streets into categories
            (“levels”) based on their current and future use as development and
            growth occurs. The street levels map overlay includes roads that are
            within the jurisdictional boundaries of the City of Austin and is
            also used to identify right of way dedication requirements needed to
            accommodate future roadway conditions. These future roadway
            conditions are reflective of the recommended improvements in the
            ASMP. For more information, visit{" "}
            <a
              href="https://www.austintexas.gov/department/austin-strategic-mobility-plan"
              target="_blank"
              rel="noopener noreferrer"
            >
              Austin Strategic Mobility Plan
            </a>
            .
          </div>
          <div className="font-weight-bold">
            High-Injury Network/High-Injury Roadways
          </div>
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
          <div>
            More recent analysis applies a comprehensive cost value to all
            people involved in crashes, which has highlighted 13 segments on the
            HIN that have a particularly high concentration of high crash
            locations where Vision Zero is focusing short-term engineering,
            education, and enforcement initiatives. These 13{" "}
            <a
              href="http://austintexas.gov/page/high-injury-roadway-segments"
              target="_blank"
              rel="noopener noreferrer"
            >
              “High-Injury Roadways”
            </a>{" "}
            are represented by darker, wider lines on the map.
          </div>
        </>
      ),
    },
  },
};
