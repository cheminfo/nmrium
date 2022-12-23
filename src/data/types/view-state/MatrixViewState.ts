import { MatrixFilter } from '../../matrixGeneration';
import { Nuclei } from '../common/Nucleus';
import { ExclusionZone } from '../data1d/ExclusionZone';

export interface MatrixOptions {
  /**
   * Matrix generation filters
   * @default []
   *
   */
  filters: (MatrixFilter & { options: object })[];
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

// eslint-disable-next-line @typescript-eslint/ban-types
export type MatrixViewState = Record<Nuclei, MatrixOptions> | {};
