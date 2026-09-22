import React, { useEffect, useState } from "react";
import axios from "axios";
import { Source, Layer } from "react-map-gl/mapbox";
import { arcgisToGeoJSON } from "@terraformer/arcgis";
import { colors } from "../../constants/colors";
import MapCompassSpinner from "src/views/map/MapCompassSpinner";

export const cityCouncilDistrictsUrl =
  "https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/BOUNDARIES_single_member_districts/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&relationParam=&returnGeodetic=false&outFields=*&returnGeometry=true&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=8&outSR=4326&defaultSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=json";

const cityCouncilDataLayer = {
  id: "cityCouncil",
  type: "fill",
  paint: {
    "fill-opacity": 0.25,
    "fill-color": [
      "match",
      ["get", "COUNCIL_DISTRICT"],
      1,
      colors.mapCityCouncil1,
      2,
      colors.mapCityCouncil2,
      3,
      colors.mapCityCouncil3,
      4,
      colors.mapCityCouncil4,
      5,
      colors.mapCityCouncil5,
      6,
      colors.mapCityCouncil6,
      7,
      colors.mapCityCouncil7,
      8,
      colors.mapCityCouncil8,
      9,
      colors.mapCityCouncil9,
      10,
      colors.mapCityCouncil10,
      /* other */ "#ccc",
    ],
  },
};

export default function CouncilDistrictLayer({ beforeId, set }) {
  const [geojson, setGeojson] = useState(null);

  // Fetch City Council Districts geojson
  useEffect(() => {
    const abortController = new AbortController();

    axios
      .get(cityCouncilDistrictsUrl, { signal: abortController.signal })
      .then((res) => {
        const fixedGeoJSON = arcgisToGeoJSON(res.data);
        setGeojson(fixedGeoJSON);
      })
      .catch((error) => {
        if (axios.isCancel(error)) return;
        console.error("Failed to fetch city council data:", error);
      });

    return () => {
      abortController.abort();
    };
  }, []);

  // show spinner until map data loads
  if (!geojson) return <MapCompassSpinner isSpinning={true} />;

  return (
    <Source id="cityCouncil-source" type="geojson" data={geojson}>
      <Layer beforeId={beforeId} {...cityCouncilDataLayer} />
    </Source>
  );
}
