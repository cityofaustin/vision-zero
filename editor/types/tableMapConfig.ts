import { FeatureCollection } from "geojson";
import MapGL, { LayerProps } from "react-map-gl";
import TableMapPopupContent from "@/components/TableMapPopupContent";
import LocationTableMapPopupContent from "@/components/LocationsTableMapPopupContent";

// importing MapProps does not work: https://github.com/visgl/react-map-gl/issues/2140
type MapGLComponentProps = React.ComponentProps<typeof MapGL>;

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
 * Returns popup component based on component named in mapConfig.
 * Default is TableMapPopupContent
 */
export const getPopupComponent = (
  popupName: "locationTableMap" | undefined
) => {
  switch (popupName) {
    case "locationTableMap":
      return LocationTableMapPopupContent;
    default:
      return TableMapPopupContent;
  }
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
   * Optional react-map-gl props to pass to the Map instance
   */
  mapProps?: Partial<MapGLComponentProps>;
  /**
   * Optional limit to the number of features to query and render
   * This will override the `limit` set in the QueryConfig
   *
   * todo: implement this ;)
   */
  featureLimit?: number;
  /**
   * Optional name of popup component, if not provided then Map will use TableMapPopupContent component
   */
  popupComponentName?: "locationTableMap";
  /**
   *
   */
  defaultBasemap: "streets" | "aerial";
}
