export interface ContourOptions {
  positive: {
    contourLevels: [number, number];
    numberOfLayers: number;
  };
  negative: {
    contourLevels: [number, number];
    numberOfLayers: number;
  };
}
