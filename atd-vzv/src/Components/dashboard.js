import React from "react";
import Fatalities from "./fatalities";
import SeriousInjuries from "./seriousInjuries";
import SeriousInjuryAndFatalCrashesByMonth from "./seriousInjuryAndFatalCrashesByMonth";
import SeriousInjuryAndFatalCrashesByMode from "./seriousInjuryAndFatalCrashesByMode";

const Dashboard = props => {
  return (
    <div>
      {/* TODO Year-to-Date Fatalities - display pictorial chart */}
      <Fatalities />
      {/* TODO Year-to-Date Serious Injuries - display sums as integers */}
      <SeriousInjuries />
      {/* TODO Serious Injury + Fatal Crashes by Month - display as line graph */}
      <SeriousInjuryAndFatalCrashesByMonth />
      {/* TODO Serious Injury + Fatal Crashes by Mode - display as doughnuts */}
      <SeriousInjuryAndFatalCrashesByMode />
    </div>
  );
};

export default Dashboard;
