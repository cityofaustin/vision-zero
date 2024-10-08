const { spawnSync, spawn } = require("child_process");
const fs = require("fs");
const mapshaper = require("mapshaper");

const geoJson = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-104.0, 48.0],
            [-100.0, 48.0],
            [-100.0, 44.0],
            [-104.0, 44.0],
            [-104.0, 48.0],
          ],
        ],
      },
      properties: {},
    },
  ],
};

async function main() {
  const data = await mapshaper.runCommands([
    "data/signal_engineer_areas.geojson",
    "-simplify",
    "dp",
    "20%",
    "-o",
    "precision=0.00001",
    "-",
  ]);
  console.log("HIIII")
  console.log(data);
}

main();
