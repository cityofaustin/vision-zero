
import { Source, Layer } from "react-map-gl/mapbox";
import { colors } from "../../constants/colors";


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

export default function CouncilDistrictLayer({ beforeId, data }) {
  if (!data) {
    return null;
  }
  return (
    <Source id="cityCouncil-source" type="geojson" data={data}>
      <Layer beforeId={beforeId} {...cityCouncilDataLayer} />
    </Source>
  );
}
