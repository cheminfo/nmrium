import { MatrixFilter } from '../../matrixGeneration.js';

import { ExclusionZone } from './ExclusionZone.js';

export interface MatrixOptions {
  /**
   * Matrix generation filters
   * @default []
   *
   */
  filters: Array<MatrixFilter & { options: object }>;
  /**
   * Exclusion zones
   * @default []
   */
  exclusionsZones: ExclusionZone[];
  /**
   * range
   */
  range: { from: number; to: number };

  /**
   * number of points
   */
  numberOfPoints: number;
}
