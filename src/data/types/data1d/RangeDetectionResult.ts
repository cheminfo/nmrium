import type { Range } from '@zakodium/nmr-types';

export interface RangeDetectionResult extends Omit<
  Range,
  'integration' | 'kind' | 'signals'
> {
  absolute: number;
  min: number;
  max: number;
}
