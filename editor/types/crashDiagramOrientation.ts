export type CrashDiagramOrientation = {
  /** scale/zoom level at which the photo is displayed */
  scale: number | undefined;
  /** image rotation in degrees, -180 to 180*/
  rotation: number;
  positionX: number | undefined;
  positionY: number | undefined;
};
