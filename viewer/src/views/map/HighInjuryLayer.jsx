import React from "react";
import { Source, Layer } from "react-map-gl/mapbox";
import { colors } from "../../constants/colors";

const highInjuryTilesUrl =
  "https://tiles.arcgis.com/tiles/0L95CJ0VTaxqcmED/arcgis/rest/services/High_Injury_Network_HIR_2022/VectorTileServer/tile/{z}/{y}/{x}.pbf";

const highInjuryLayers = [
  {
    id: "highInjuryNetwork",
    symbol: 1,
    color: colors.mapHighInjuryNetwork,
    width: 2,
  },
  {
    id: "highInjuryRoadways",
    symbol: 0,
    color: colors.mapHighInjuryRoadways,
    width: 4,
  },
];

/**
 * Layer of High Injury Network & Roadways (focused segments)
 **/
export default function HighInjuryLayer({ beforeId }) {
  return (
    <Source id="high-injury" type="vector" tiles={[highInjuryTilesUrl]}>
      {highInjuryLayers.map(({ id, symbol, color, width }) => (
        <Layer
          key={id}
          id={id}
          beforeId={beforeId}
          type="line"
          source-layer="Combined_HIN_HIR"
          filter={["==", ["get", "_symbol"], symbol]}
          layout={{ "line-join": "round" }}
          paint={{ "line-color": color, "line-width": width }}
        />
      ))}
    </Source>
  );
}
