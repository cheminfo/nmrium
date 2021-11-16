import { ContourOptions } from './ContourOptions';

export interface Display2D {
  name: string;
  positiveColor: string;
  negativeColor: string;
  isVisible: boolean;
  isPositiveVisible: boolean;
  isNegativeVisible: boolean;
  contourOptions: ContourOptions;
}
