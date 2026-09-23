import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { arcgisToGeoJSON } from "@terraformer/arcgis";
import { StoreContext } from "src/constants/context";
import Map, { Source, Layer } from "react-map-gl/mapbox";
import MapControls from "./MapControls";
import MapPolygonFilter from "./MapPolygonFilter";
import MapCompassSpinner from "./MapCompassSpinner";
import { createMapDataUrl } from "./helpers";
import {
  mapInitalViewState,
  mapNavBbox,
  cityCouncilDistrictsUrl,
} from "./mapData";
import { crashGeoJSONEndpointUrl } from "../summary/queries/socrataQueries";
import {
  baseSourceAndLayer,
  fatalitiesDataLayer,
  fatalitiesOutlineDataLayer,
  seriousInjuriesDataLayer,
  seriousInjuriesOutlineDataLayer,
} from "./map-style";
import axios from "axios";
import { useIsTablet } from "../../constants/responsive";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import MapInfoBox from "./InfoBox/MapInfoBox";
import MapPolygonInfoBox from "./InfoBox/MapPolygonInfoBox";
import MapGeocoder from "./Geocoder/Geocoder";
import HighInjuryLayer from "src/views/map/HighInjuryLayer";
import AsmpLayers from "src/views/map/AsmpLayer";
import CouncilDistrictLayer from "src/views/map/CouncilDistrictLayer";
import TravisCountyBboxLayer from "src/views/map/TravisCountyBboxLayer";

const sortAndCountCrashData = (data) => {
  if (!data) {
    return [null, null];
  }
  const crashCounts = { injury: 0, fatality: 0 };
  const features =
    data.features &&
    data.features.reduce(
      (acc, feature) => {
        const injuryCount =
          Number(feature.properties.sus_serious_injry_cnt) || 0;
        const fatalityCount = Number(feature.properties.death_cnt) || 0;
        crashCounts["injury"] += injuryCount;
        crashCounts["fatality"] += fatalityCount;

        if (injuryCount) {
          acc.injuries.features.push(feature);
        }
        if (fatalityCount) {
          acc.fatalities.features.push(feature);
        }
        return acc;
      },
      {
        fatalities: { ...data, features: [] },
        injuries: { ...data, features: [] },
      },
    );

  return [features, crashCounts];
};

const MapComponent = () => {
  const mapRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  // Mirrors `isDrawing` (see effect below) for synchronous reads in onClick
  // to suppress feature popups (e.g. council district) that would otherwise
  // fire while the user is mid-polygon-draw.
  const isDrawingPolygonRef = useRef(false);
  const isTablet = useIsTablet();
  const [selectedFeature, setSelectedFeature] = useState(null);

  const {
    mapFilters: [filters],
    mapFilterType: [isMapTypeSet],
    mapDateRange: dateRange,
    mapOverlay: [overlay],
    mapTimeWindow: [mapTimeWindow],
    mapPolygon: [mapPolygon, setMapPolygon],
  } = React.useContext(StoreContext);

  const apiUrl = useMemo(
    () =>
      createMapDataUrl(
        crashGeoJSONEndpointUrl,
        filters,
        dateRange,
        mapPolygon,
        mapTimeWindow,
      ),
    [filters, dateRange, mapPolygon, mapTimeWindow],
  );

  const [crashResponse, setCrashResponse] = useState({ url: null, data: null });
  const crashData = apiUrl ? crashResponse.data : null;
  const isCrashDataFetching = !!apiUrl && crashResponse.url !== apiUrl;
  const [mapData, crashCounts] = useMemo(() => {
    return sortAndCountCrashData(crashData);
  }, [crashData]);

  // Fetch initial crash data and refetch upon filters change
  useEffect(() => {
    if (!apiUrl) return;

    const abortController = new AbortController();

    axios
      .get(apiUrl, { signal: abortController.signal })
      .then((res) => {
        if (abortController.signal.aborted) return;
        setCrashResponse({ url: apiUrl, data: res.data });
      })
      .catch((error) => {
        if (axios.isCancel(error) || abortController.signal.aborted) return;
        console.error("Failed to fetch map data:", error);
        // Mark this URL as settled so the spinner stops; keep previous data
        setCrashResponse((prev) => ({ ...prev, url: apiUrl }));
      });

    return () => abortController.abort();
  }, [apiUrl]);

  // fetch council district geojson when overlay is enabled
  const [councilDistrictData, setCouncilDistrictData] = useState(null);
  const shouldFetchCouncilDistrictData =
    overlay.name === "cityCouncil" && !councilDistrictData;

  useEffect(() => {
    const abortController = new AbortController();
    if (shouldFetchCouncilDistrictData) {
      axios
        .get(cityCouncilDistrictsUrl, { signal: abortController.signal })
        .then((res) => setCouncilDistrictData(arcgisToGeoJSON(res.data)))
        .catch((error) => {
          if (axios.isCancel(error)) return;
          console.error("Failed to fetch city council data:", error);
        });
    }

    return () => {
      abortController.abort();
    };
  }, [shouldFetchCouncilDistrictData]);

  // Set interactive layer IDs
  const interactiveLayerIds = useMemo(() => {
    const layers = [
      isMapTypeSet.fatal && "fatalities",
      isMapTypeSet.injury && "seriousInjuries",
      overlay.name === "cityCouncil" && "cityCouncil",
    ];
    return layers.filter((id) => !!id);
  }, [isMapTypeSet, overlay.name]);

  // mapbox-gl-draw closes a polygon on "mouseup" (its own event delegation,
  // not the browser's "click" event), which is what flips `isDrawing` to
  // false. The browser's trailing "click" event for that same gesture - the
  // one onClick's popup-suppression logic below reacts to - fires just
  // after. Deferring the ref reset by a tick keeps clicks suppressed
  // through that trailing click, while still clearing in time for the
  // user's next real click.
  useEffect(() => {
    if (isDrawing) {
      isDrawingPolygonRef.current = true;
      return;
    }
    const timeoutId = setTimeout(() => {
      isDrawingPolygonRef.current = false;
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [isDrawing]);

  // Event handler for selecting crash points
  const onClick = useCallback((event) => {
    if (!mapRef.current || isDrawingPolygonRef.current) return;

    const { features } = event;
    let selectedFeatureDraft =
      features &&
      features.find(
        (f) =>
          f.layer.id === "fatalities" ||
          f.layer.id === "seriousInjuries" ||
          f.layer.id === "cityCouncil",
      );

    let selectedFeatureLayer =
      (!!selectedFeatureDraft &&
        selectedFeatureDraft.layer &&
        selectedFeatureDraft.layer.id) ||
      null;

    if (!!selectedFeatureDraft && selectedFeatureLayer === "cityCouncil") {
      selectedFeatureDraft = {
        ...selectedFeatureDraft,
        properties: {
          ...selectedFeatureDraft.properties,
          latitude: event.lngLat.lat,
          longitude: event.lngLat.lng,
        },
      };
    }

    if (
      !!selectedFeatureDraft &&
      (selectedFeatureLayer === "fatalities" ||
        selectedFeatureLayer === "seriousInjuries")
    ) {
      try {
        const map = mapRef.current.getMap();
        if (map) {
          selectedFeatureDraft = {
            ...selectedFeatureDraft,
            properties: {
              ...selectedFeatureDraft.properties,
              pixelCoordinates: map.project([
                parseFloat(selectedFeatureDraft.properties.longitude),
                parseFloat(selectedFeatureDraft.properties.latitude),
              ]),
            },
          };
        }
      } catch (error) {
        console.debug("Error projecting coordinates:", error);
      }
    }

    setSelectedFeature(selectedFeatureDraft);
  }, []);

  // Handle map load
  const handleMapLoad = useCallback((event) => {
    const map = event.target;
    const container = map.getContainer();
    if (!container) return;

    // Add role="listitem" to attribution links
    const attrList = container.querySelector(".mapboxgl-ctrl-attrib-inner");
    if (attrList) {
      attrList.querySelectorAll("a").forEach((a) => {
        a.setAttribute("role", "listitem");
      });
    }

    // Add a visually hidden label to the attribution toggle button
    const toggleBtn = container.querySelector(".mapboxgl-ctrl-attrib-button");
    if (toggleBtn) {
      const hiddenLabel = document.createElement("span");
      hiddenLabel.textContent = "Toggle attribution";
      hiddenLabel.setAttribute("aria-hidden", "true");
      hiddenLabel.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0,0,0,0);
        white-space: nowrap;
        border: 0;
      `;
      toggleBtn.appendChild(hiddenLabel);
    }

    // Align aria-label with visible text on "Improve this map" link
    const improveLink = container.querySelector(".mapbox-improve-map");
    if (improveLink) {
      improveLink.setAttribute("aria-label", "Improve this map");
    }
  }, []);

  const fatalVisibility = {
    visibility: isMapTypeSet.fatal ? "visible" : "none",
  };
  const injuryVisibility = {
    visibility: isMapTypeSet.injury ? "visible" : "none",
  };

  return (
    <Map
      ref={mapRef}
      initialViewState={mapInitalViewState}
      maxBounds={[
        [mapNavBbox.longitude.min, mapNavBbox.latitude.min],
        [mapNavBbox.longitude.max, mapNavBbox.latitude.max],
      ]}
      minZoom={10}
      mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
      mapStyle="mapbox://styles/mapbox/light-v11"
      cursor="default"
      interactiveLayerIds={interactiveLayerIds}
      onClick={onClick}
      onLoad={handleMapLoad}
      style={{ width: "100%", height: "100%" }}
    >
      {baseSourceAndLayer}
      {/* Z-order anchor: overlays insert below this, crash points get added above it */}
      <Layer
        id="overlay-slot"
        type="background"
        layout={{ visibility: "none" }}
      />
      {overlay.name === "asmp" && (
        <AsmpLayers beforeId="overlay-slot" activeLevels={overlay.options} />
      )}
      {overlay.name === "highInjury" && (
        <HighInjuryLayer beforeId="overlay-slot" />
      )}
      {overlay.name === "cityCouncil" && (
        <CouncilDistrictLayer
          beforeId="overlay-slot"
          data={councilDistrictData}
        />
      )}
      {!!mapData && (
        <>
          <Source id="crashInjuries" type="geojson" data={mapData.injuries}>
            <Layer
              {...seriousInjuriesOutlineDataLayer}
              layout={injuryVisibility}
            />
            <Layer {...seriousInjuriesDataLayer} layout={injuryVisibility} />
          </Source>
          <Source id="crashFatalities" type="geojson" data={mapData.fatalities}>
            <Layer {...fatalitiesOutlineDataLayer} layout={fatalVisibility} />
            <Layer {...fatalitiesDataLayer} layout={fatalVisibility} />
          </Source>
        </>
      )}
      <TravisCountyBboxLayer beforeId="overlay-slot" />
      {selectedFeature && (
        <MapInfoBox
          selectedFeature={selectedFeature}
          setSelectedFeature={setSelectedFeature}
          isTablet={isTablet}
          type={selectedFeature.layer.id}
        />
      )}
      {!!crashCounts && mapPolygon && !selectedFeature && (
        <MapPolygonInfoBox
          crashCounts={crashCounts}
          isMapTypeSet={isMapTypeSet}
        />
      )}
      <MapCompassSpinner
        isSpinning={shouldFetchCouncilDistrictData || isCrashDataFetching}
      />
      <MapControls />
      <MapPolygonFilter
        mapPolygon={mapPolygon}
        setMapPolygon={setMapPolygon}
        isDrawing={isDrawing}
        setIsDrawing={setIsDrawing}
      />
      <MapGeocoder />
    </Map>
  );
};

export default MapComponent;
