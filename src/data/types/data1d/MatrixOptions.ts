import { MatrixFilter } from '../../matrixGeneration';

import { ExclusionZone } from './ExclusionZone';

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
