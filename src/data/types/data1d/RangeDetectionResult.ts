import { Range } from 'nmr-processing';

export interface RangeDetectionResult
  extends Omit<Range, 'integration' | 'kind' | 'signals'> {
  absolute: number;
  min: number;
  max: number;
}
