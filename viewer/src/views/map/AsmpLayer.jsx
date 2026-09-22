import React from "react";
import { Source, Layer } from "react-map-gl/mapbox";
import { colors } from "../../constants/colors";

const asmpTilesUrl =
  "https://tiles.arcgis.com/tiles/0L95CJ0VTaxqcmED/arcgis/rest/services/ASMP_Streets_VectorTile/VectorTileServer/tile/{z}/{y}/{x}.pbf";

const asmpLevels = [
  { level: "1", symbol: 0, color: colors.mapAsmp1 },
  { level: "2", symbol: 1, color: colors.mapAsmp2 },
  { level: "3", symbol: 2, color: colors.mapAsmp3 },
  { level: "4", symbol: 3, color: colors.mapAsmp4 },
  { level: "5", symbol: 4, color: colors.mapAsmp5 },
];

export default function AsmpLayers({ activeLevels, beforeId }) {
  const layers = asmpLevels.filter(({ level }) => activeLevels.includes(level));
  if (!layers.length) return null;

  return (
    <Source id="asmp-network" type="vector" tiles={[asmpTilesUrl]}>
      {layers.map(({ level, symbol, color }) => (
        <Layer
          key={level}
          id={`asmplayer${level}`}
          beforeId={beforeId}
          type="line"
          source-layer="asmp_street_network"
          filter={["==", ["get", "_symbol"], symbol]}
          layout={{ "line-cap": "round", "line-join": "round" }}
          paint={{ "line-color": color, "line-width": 2 }}
        />
      ))}
    </Source>
  );
}
