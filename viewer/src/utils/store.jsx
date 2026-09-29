import React, { useState, useEffect, useMemo, useReducer } from "react";
import { dataStartDate, dataEndDate } from "../constants/time";
import { useIsTablet } from "../constants/responsive";
import { mapFilterReducer } from "src/constants/map";
import { StoreContext } from "src/constants/context";

export default function StoreProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mapFilters, mapFilterDispatch] = useReducer(mapFilterReducer, []);
  const [isMapTypeSet, setIsMapTypeSet] = useState({
    fatal: true,
    injury: true,
  });
  const [mapDateRange, setMapDateRange] = useState({
    start: dataStartDate,
    end: dataEndDate,
  });
  const [mapTimeWindow, setMapTimeWindow] = useState("");
  const [mapOverlay, setMapOverlay] = useState({
    name: "",
    options: [],
  });
  const [mapPolygon, setMapPolygon] = useState(null);

  // SideDrawer should never be open when not mobile
  const isTablet = useIsTablet();
  useEffect(() => {
    if (!isTablet) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- fix in issue #29044
      setIsOpen(false);
    }
  }, [isTablet, setIsOpen]);

  const store = useMemo(
    () => ({
      mapFilters: [mapFilters, mapFilterDispatch],
      mapFilterType: [isMapTypeSet, setIsMapTypeSet],
      mapDateRange,
      setMapDateRange,
      mapTimeWindow: [mapTimeWindow, setMapTimeWindow],
      sidebarToggle: [isOpen, setIsOpen],
      mapOverlay: [mapOverlay, setMapOverlay],
      mapPolygon: [mapPolygon, setMapPolygon],
    }),
    [
      mapFilters,
      isMapTypeSet,
      mapDateRange,
      mapTimeWindow,
      isOpen,
      mapOverlay,
      mapPolygon,
    ],
  );

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}
