import React from "react";
import raceEthnicityTable2018 from "./raceEthnicityTable2018.png";
import { popEsts } from "../../constants/popEsts";

const formatNumber = (num) => {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
};

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
          <div className="font-weight-bold">Sex</div>
          <div className="mb-2">
            This visualization relies on the information entered by officers
            into the official crash reports. Officers are encouraged to use the
            sex that appears on the Driver License/ID Card.
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
      title: "By Year & Month",
      html: (
        <>
          <div>
            This chart compares the current year's traffic fatalities and
            serious injuries to the average traffic fatalities and serious
            injuries of the previous five years. Users can compare traffic
            fatalities and serious injuries per month, as well as compare how
            the total traffic fatality and serious injury count changes
            throughout the year.
          </div>
        </>
      ),
    },
    byPopulation: {
      title: "Austin Area Population Histories & Forecasts",
      html: (
        <>
          <div className="font-weight-bold">
            Austin Area Population Histories & Forecasts
          </div>
          <div className="mb-2">
            It is an industry standard to measure traffic-related deaths and
            serious injuries in cities per 100,000 residents (see National
            Highway Traffic Safety Administration{" "}
            <a
              href="https://www-fars.nhtsa.dot.gov/Main/index.aspx"
              target="_blank"
              rel="noopener noreferrer"
            >
              website
            </a>
            ). This measure is important because it normalizes the number of
            fatalities and serious injuries compared to a city's population.
            This provides further insight when comparing traffic-related deaths
            and serious injuries across peer cities, as well as changes to an
            individual city's population over time. Below is a table showing how
            Austin's population continues to increase each year.
            <div>
              <div className="mt-2">
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">Year</th>
                      <th scope="col">Population</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">{new Date().getFullYear()}</th>
                      <td>
                        {!!popEsts["years"][new Date().getFullYear()]
                          ? formatNumber(
                              popEsts["years"][new Date().getFullYear()]
                            )
                          : "No data available"}
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">{new Date().getFullYear() - 1}</th>
                      <td>
                        {formatNumber(
                          popEsts["years"][new Date().getFullYear() - 1]
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">{new Date().getFullYear() - 2}</th>
                      <td>
                        {formatNumber(
                          popEsts["years"][new Date().getFullYear() - 2]
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">{new Date().getFullYear() - 3}</th>
                      <td>
                        {formatNumber(
                          popEsts["years"][new Date().getFullYear() - 3]
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">{new Date().getFullYear() - 4}</th>
                      <td>
                        {formatNumber(
                          popEsts["years"][new Date().getFullYear() - 4]
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-2">
                Source:{" "}
                <a
                  href={popEsts["sourceURL"]}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {popEsts["sourceString"]}
                </a>
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
          <div>
            <div className="font-weight-bold mb-2">Definitions</div>
            <div className="mb-2">
              <strong>Fatality</strong>: A fatality is defined as a death that
              resulted due to injuries sustained from the crash, at the scene or
              within 30 days of the crash.
            </div>
            <div className="mb-2">
              <div className="mb-2">
                <strong>Suspected Serious Injury</strong>: A suspected serious
                injury is defined as a severe injury that prevents continuation
                of normal activities, including:
              </div>
              <ul className="pl-3">
                <li>
                  Severe laceration resulting in exposure of underlying
                  tissues/muscle/organs or resulting in significant loss of
                  blood
                </li>
                <li>Broken or distorted extremity (arm or leg)</li>
                <li>Crush injuries</li>
                <li>
                  Suspected skull, chest, or abdominal injury other than bruises
                  or minor lacerations
                </li>
                <li>
                  Significant burns (second and third degree burns over 10% or
                  more of the body)
                </li>
                <li>Unconsciousness when taken from the crash scene</li>
                <li>Paralysis</li>
              </ul>
            </div>
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
            document. A detailed crash analysis of crashes from 2017-2021 was
            used to identify the Combined High-Injury Network, which includes
            just 8% of the city’s street network but contains nearly 60% of all
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
