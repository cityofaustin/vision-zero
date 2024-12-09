export type MultiPolygon = {
  type: "MultiPolygon";
  crs?: {
    type: string;
    properties: Record<string, unknown>;
  };
  coordinates: number[][][][];
};
