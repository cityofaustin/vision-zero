import MapGL, { LayerProps } from "react-map-gl";
import TableMapPopupContent from "@/components/TableMapPopupContent";
import LocationTableMapPopupContent from "@/components/LocationsTableMapPopupContent";
import FatalitiesMapPopupContent from "@/components/FatalitiesMapPopupContent";

// importing MapProps does not work: https://github.com/visgl/react-map-gl/issues/2140
type MapGLComponentProps = React.ComponentProps<typeof MapGL>;

/**
 * Returns popup component based on component named in mapConfig.
 * Default is TableMapPopupContent
 */
export const getPopupComponent = (
  popupName: "locationTableMap" | "fatalitiesTableMap" | undefined
) => {
  console.log(popupName)
  switch (popupName) {
    case "locationTableMap":
      return LocationTableMapPopupContent;
    case "fatalitiesTableMap":
      return FatalitiesMapPopupContent;
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
  popupComponentName?: "locationTableMap" | "fatalitiesTableMap";
  /**
   *
   */
  defaultBasemap: "streets" | "aerial";
}
