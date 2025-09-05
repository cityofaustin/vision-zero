import { FeatureCollection } from "geojson";
import { LayerProps } from "react-map-gl";

/**
 * An index of functions that transform input data into a geojson feature collection
 */
export const geoJsonTransformers = {
  latLon: (data: Record<string, unknown>[]): FeatureCollection => {
    if (!data || data.length === 0) {
      return {
        type: "FeatureCollection" as const,
        features: [],
      };
    }
    const features = data
      .filter((row) => row.latitude && row.longitude) // Filter out items without coordinates
      .map((row, index) => ({
        type: "Feature" as const,
        id: index,
        geometry: {
          type: "Point" as const,
          coordinates: [Number(row.longitude), Number(row.latitude)],
        },
        properties: {
          ...row, // Include all original data as properties
        },
      }));
    return {
      type: "FeatureCollection" as const,
      features,
    };
  },
};

/**
 * Configuration object for rendering the map component that plugs
 * into the Table component
 */
export interface TableMapConfig {
  /**
   * If the map is toggled on and should be rendered
   */
  isActive: boolean;
  /**
   * Name of the geojson transformer function to use when converting the input table to geojson
   */
  geojsonTransformerName: "latLon";
  /**
   * Settings to be passed to the geojson layer
   */
  layerProps?: LayerProps;
  /**
   * Optional limit to the number of features to query and render
   * This will override the `limit` set in the QueryConfig
   *
   * todo: implement this ;)
   */
  featureLimit?: number;
}
