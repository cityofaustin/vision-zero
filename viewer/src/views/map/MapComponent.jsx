import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { StoreContext } from "src/constants/context";
import Map, { Source, Layer } from "react-map-gl";
import MapControls from "./MapControls";
import MapPolygonFilter from "./MapPolygonFilter";
import MapCompassSpinner from "./MapCompassSpinner";
import { createMapDataUrl, useMapEventHandler } from "./helpers";
import { mapInit, travisCountyBboxGeoJSON, mapNavBbox } from "./mapData";
import { crashGeoJSONEndpointUrl } from "../summary/queries/socrataQueries";
import {
  baseSourceAndLayer,
  fatalitiesDataLayer,
  fatalitiesOutlineDataLayer,
  seriousInjuriesDataLayer,
  seriousInjuriesOutlineDataLayer,
  asmpSourceConfig,
  buildAsmpLayers,
  asmpConfig,
  buildHighInjuryLayer,
  cityCouncilDataLayer,
  travisCountyDataLayer,
} from "./map-style";
import axios from "axios";
import { useIsTablet } from "../../constants/responsive";
// import AnimatedIcon from "./AnimatedIcon";

import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import MapInfoBox from "./InfoBox/MapInfoBox";
import MapPolygonInfoBox from "./InfoBox/MapPolygonInfoBox";
import MapGeocoder from "./Geocoder/Geocoder";
import { arcgisToGeoJSON } from "@terraformer/arcgis";

import mapboxgl from "mapbox-gl";

const MapComponent = () => {
  const [viewState, setViewState] = useState({
    longitude: mapInit.longitude,
    latitude: mapInit.latitude,
    zoom: mapInit.zoom,
    bearing: mapInit.bearing || 0,
    pitch: mapInit.pitch || 0,
  });

  const mapRef = useRef(null);
  const isMounted = useRef(true);
  const isMapReady = useRef(false);
  const eventListenersRef = useRef([]);

  const isTablet = useIsTablet();

  const [mapData, setMapData] = useState("");
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [cityCouncilOverlay, setCityCouncilOverlay] = useState(null);
  const [isMapDataLoading, setIsMapDataLoading] = useState(false);
  const [crashCounts, setCrashCounts] = useState(null);
  const [, setPointData] = useState(null);

  const {
    mapFilters: [filters],
    mapFilterType: [isMapTypeSet],
    mapDateRange: dateRange,
    mapOverlay: [overlay],
    mapTimeWindow: [mapTimeWindow],
    mapPolygon: [mapPolygon, setMapPolygon],
  } = React.useContext(StoreContext);

  // Cleanup function
  const cleanupMap = useCallback(() => {
    if (mapRef.current) {
      try {
        const map = mapRef.current.getMap();
        if (map && !map._removed && typeof map.remove === "function") {
          // Remove all event listeners
          eventListenersRef.current.forEach(({ event, handler }) => {
            try {
              map.off(event, handler);
            } catch (e) {
              // Ignore
            }
          });
          eventListenersRef.current = [];

          // Remove the map
          map.remove();
        }
      } catch (error) {
        console.debug("Map cleanup error:", error.message);
      }
    }
    mapRef.current = null;
    isMapReady.current = false;
  }, []);

  // Component unmount cleanup
  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
      cleanupMap();
    };
  }, [cleanupMap]);

  // Add/remove listeners for spinner logic
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !isMounted.current) return;

    const onData = () => {
      if (isMounted.current) setIsMapDataLoading(true);
    };
    const onIdle = () => {
      if (isMounted.current) setIsMapDataLoading(false);
    };

    map.on("data", onData);
    map.on("idle", onIdle);
    eventListenersRef.current.push({ event: "data", handler: onData });
    eventListenersRef.current.push({ event: "idle", handler: onIdle });

    return () => {
      if (map && !map._removed) {
        map.off("data", onData);
        map.off("idle", onIdle);
      }
    };
  }, []);

  // Fetch initial crash data and refetch upon filters change
  useEffect(() => {
    if (!isMounted.current) return;

    const sortAndCountMapData = (data) => {
      const crashCounts = { injury: 0, fatality: 0 };
      const features =
        data.features &&
        data.features.reduce(
          (acc, feature) => {
            crashCounts["injury"] += parseInt(
              feature.properties.sus_serious_injry_cnt,
            );
            crashCounts["fatality"] += parseInt(feature.properties.death_cnt);

            if (parseInt(feature.properties.sus_serious_injry_cnt) > 0) {
              acc.injuries.features.push(feature);
            }
            if (parseInt(feature.properties.death_cnt) > 0) {
              acc.fatalities.features.push(feature);
            }
            return acc;
          },
          {
            fatalities: { ...data, features: [] },
            injuries: { ...data, features: [] },
          },
        );

      if (isMounted.current) {
        setCrashCounts(crashCounts);
      }
      return features;
    };

    const apiUrl = createMapDataUrl(
      crashGeoJSONEndpointUrl,
      filters,
      dateRange,
      mapPolygon,
      mapTimeWindow,
    );

    if (apiUrl) {
      const abortController = new AbortController();

      axios
        .get(apiUrl, { signal: abortController.signal })
        .then((res) => {
          if (!isMounted.current) return;
          const sortedMapData = sortAndCountMapData(res.data);
          setMapData(sortedMapData);
        })
        .catch((error) => {
          if (error.name === "AbortError") return;
          console.error("Failed to fetch map data:", error);
        });

      return () => {
        abortController.abort();
      };
    }
  }, [filters, dateRange, mapTimeWindow, mapPolygon]);

  // Fetch City Council Districts geojson
  useEffect(() => {
    if (!isMounted.current) return;

    const abortController = new AbortController();
    const overlayUrl = `https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/BOUNDARIES_single_member_districts/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&relationParam=&returnGeodetic=false&outFields=*&returnGeometry=true&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=8&outSR=4326&defaultSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=json&token=`;

    axios
      .get(overlayUrl, { signal: abortController.signal })
      .then((res) => {
        if (!isMounted.current) return;
        const fixedGeoJSON = arcgisToGeoJSON(res.data);
        setCityCouncilOverlay(fixedGeoJSON);
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        console.error("Failed to fetch city council data:", error);
      });

    return () => {
      abortController.abort();
    };
  }, []);

  // Restrict map navigation to bounding box around Travis County
  const restrictNavAndZoom = useCallback((viewState) => {
    const restricted = { ...viewState };

    if (restricted.longitude < mapNavBbox.longitude.min) {
      restricted.longitude = mapNavBbox.longitude.min;
    }
    if (restricted.longitude > mapNavBbox.longitude.max) {
      restricted.longitude = mapNavBbox.longitude.max;
    }
    if (restricted.latitude < mapNavBbox.latitude.min) {
      restricted.latitude = mapNavBbox.latitude.min;
    }
    if (restricted.latitude > mapNavBbox.latitude.max) {
      restricted.latitude = mapNavBbox.latitude.max;
    }

    if (restricted.zoom < 10) {
      restricted.zoom = 10;
    }

    return restricted;
  }, []);

  // Handle view state changes
  const onMove = useCallback(
    (evt) => {
      if (!isMounted.current) return;
      const restrictedViewState = restrictNavAndZoom(evt.viewState);
      setViewState(restrictedViewState);
    },
    [restrictNavAndZoom],
  );

  // Set interactive layer IDs
  const interactiveLayerIds = useMemo(() => {
    const layers = [
      isMapTypeSet.fatal && "fatalities",
      isMapTypeSet.injury && "seriousInjuries",
      cityCouncilOverlay && overlay.name === "cityCouncil" && "cityCouncil",
    ];
    return layers.filter((id) => !!id);
  }, [isMapTypeSet, cityCouncilOverlay, overlay.name]);

  // Event handler for selecting crash points
  const onClick = useCallback((event) => {
    if (!isMounted.current || !mapRef.current) return;

    if (
      event.srcEvent &&
      event.srcEvent.srcElement &&
      event.srcEvent.srcElement.classList
    ) {
      if (
        event.srcEvent.srcElement.classList.value.includes("mapbox") ||
        event.srcEvent.target.localName === "circle"
      )
        return;
    }

    const { features } = event;
    let selectedFeature =
      features &&
      features.find(
        (f) =>
          f.layer.id === "fatalities" ||
          f.layer.id === "seriousInjuries" ||
          f.layer.id === "cityCouncil" ||
          null,
      );

    let selectedFeatureLayer =
      (!!selectedFeature &&
        selectedFeature.layer &&
        selectedFeature.layer.id) ||
      null;

    if (!!selectedFeature && selectedFeatureLayer === "cityCouncil") {
      selectedFeature = {
        ...selectedFeature,
        properties: {
          ...selectedFeature.properties,
          latitude: event.lngLat.lat,
          longitude: event.lngLat.lng,
        },
      };
    }

    if (
      (!!selectedFeature && selectedFeatureLayer === "fatalities") ||
      selectedFeatureLayer === "seriousInjuries"
    ) {
      try {
        const map = mapRef.current.getMap();
        if (map && !map._removed) {
          selectedFeature = {
            ...selectedFeature,
            properties: {
              ...selectedFeature.properties,
              pixelCoordinates: map.project([
                parseFloat(selectedFeature.properties.longitude),
                parseFloat(selectedFeature.properties.latitude),
              ]),
            },
          };
        }
      } catch (error) {
        console.debug("Error projecting coordinates:", error);
      }
    }

    setSelectedFeature(selectedFeature);
  }, []);

  const renderCrashDataLayers = () => {
    if (!mapData) return null;

    const injuryLayer = (
      <Source id="crashInjuries" type="geojson" data={mapData.injuries}>
        <Layer {...seriousInjuriesOutlineDataLayer} />
        <Layer {...seriousInjuriesDataLayer} />
      </Source>
    );
    const fatalityLayer = (
      <Source id="crashFatalities" type="geojson" data={mapData.fatalities}>
        <Layer {...fatalitiesOutlineDataLayer} />
        <Layer {...fatalitiesDataLayer} />
      </Source>
    );
    return (
      <>
        {injuryLayer}
        {fatalityLayer}
      </>
    );
  };

  useEffect(() => {
    const animation = window.requestAnimationFrame(() => {
      if (selectedFeature && isMounted.current) setPointData({});
    });
    return () => window.cancelAnimationFrame(animation);
  }, [selectedFeature]);

  const renderSelectedLayer = () => {
    if (!selectedFeature) return null;

    // Ensure selectedFeature is a proper GeoJSON feature
    const featureData = selectedFeature;

    // Make sure it has the required structure
    if (!featureData.geometry) {
      console.warn("Selected feature missing geometry");
      return null;
    }

    const color = {
      r:
        selectedFeature.layer.paint[`${selectedFeature.layer.type}-color`].r *
        255,
      g:
        selectedFeature.layer.paint[`${selectedFeature.layer.type}-color`].g *
        255,
      b:
        selectedFeature.layer.paint[`${selectedFeature.layer.type}-color`].b *
        255,
      a: selectedFeature.layer.paint[`${selectedFeature.layer.type}-color`].a,
    };

    return (
      <Source id="selectedCrash" type="geojson" data={selectedFeature}>
        {/* <AnimatedIcon
          location={{
            x: parseFloat(selectedFeature.properties.longitude),
            y: parseFloat(selectedFeature.properties.latitude),
          }}
          paint={color}
        /> */}
      </Source>
    );
  };

  // Show/hide type layers
  useEffect(() => {
    if (!mapRef.current || !isMounted.current) return;

    const map = mapRef.current.getMap();
    if (!map || map._removed) return;

    const setLayersVisibility = (idArray, visibilityString) => {
      idArray.forEach((id) => {
        try {
          if (map.getLayer(id)) {
            map.setLayoutProperty(id, "visibility", visibilityString);
          }
        } catch (error) {
          console.debug(`Layer ${id} not found`);
        }
      });
    };

    if (map.getLayer("fatalities") && map.getLayer("fatalitiesOutline")) {
      const fatalityIds = ["fatalities", "fatalitiesOutline"];
      const fatalVisibility = isMapTypeSet.fatal ? "visible" : "none";
      setLayersVisibility(fatalityIds, fatalVisibility);
    }

    if (
      map.getLayer("seriousInjuries") &&
      map.getLayer("seriousInjuriesOutline")
    ) {
      const injuryIds = ["seriousInjuries", "seriousInjuriesOutline"];
      const injuryVisibility = isMapTypeSet.injury ? "visible" : "none";
      setLayersVisibility(injuryIds, injuryVisibility);
    }
  }, [isMapTypeSet]);

  // Handle map load
  const handleMapLoad = useCallback((event) => {
    if (!isMounted.current) return;
    isMapReady.current = true;
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

  return (
    <Map
      ref={mapRef}
      {...viewState}
      onMove={onMove}
      mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
      mapStyle="mapbox://styles/mapbox/light-v11"
      cursor="default"
      interactiveLayerIds={interactiveLayerIds}
      onClick={onClick}
      onLoad={handleMapLoad}
      style={{ width: "100%", height: "100%" }}
      // Prevent map from being removed on unmount (we handle it manually)
      preserveDrawingBuffer={false}
    >
      {baseSourceAndLayer}
      <Source {...asmpSourceConfig}>
        {buildAsmpLayers(asmpConfig, overlay)}
      </Source>
      {!!mapData && renderCrashDataLayers()}
      {selectedFeature && renderSelectedLayer()}
      {buildHighInjuryLayer(overlay)}
      {!!cityCouncilOverlay && overlay.name === "cityCouncil" && (
        <Source type="geojson" data={cityCouncilOverlay}>
          <Layer beforeId="base-layer" {...cityCouncilDataLayer} />
        </Source>
      )}
      <Source type="geojson" data={travisCountyBboxGeoJSON}>
        <Layer {...travisCountyDataLayer} />
      </Source>
      {selectedFeature && (
        <MapInfoBox
          selectedFeature={selectedFeature}
          setSelectedFeature={setSelectedFeature}
          isTablet={isTablet}
          type={selectedFeature.layer.id}
        />
      )}
      {!!crashCounts && !!mapPolygon && !selectedFeature && (
        <MapPolygonInfoBox
          crashCounts={crashCounts}
          isMapTypeSet={isMapTypeSet}
        />
      )}
      <MapCompassSpinner isSpinning={isMapDataLoading} />
      <MapControls setViewport={setViewState} />
      <MapPolygonFilter setMapPolygon={setMapPolygon} />
      <MapGeocoder handleViewportChange={onMove} />
    </Map>
  );
};

export default MapComponent;
