import type { Spectrum1D } from '@zakodium/nmrium-core';
import type { Range } from 'nmr-processing';

import { SIGNAL_INCLUDED_KINDS } from '../../../data/constants/signalsKinds.js';

export interface BaseSignal {
  assignment?: string;
  delta: number;
  id: string;
}

export type ExtractedSignal<T> = BaseSignal & T;

interface ExtractSpectrumSignalsOptions<T> {
  from?: number;
  to?: number;
  include?: (range: Range) => T;
}
export function extractSpectrumSignals<T extends object = object>(
  spectrum: Spectrum1D,
  options: ExtractSpectrumSignalsOptions<T> = {},
) {
  const result: Array<ExtractedSignal<T>> = [];
  const { from, to, include } = options;

  const ranges = spectrum?.ranges?.values;
  if (!Array.isArray(ranges) || ranges?.length === 0) {
    return [];
  }

  for (const range of ranges) {
    const rangeFrom = range.from;
    const rangeTo = range.to;
    let isInRange = true;

    if (typeof from === 'number' && typeof to === 'number') {
      isInRange = rangeFrom <= to && rangeTo >= from;
    } else if (typeof to === 'number') {
      isInRange = rangeTo <= to;
    } else if (typeof from === 'number') {
      isInRange = rangeFrom >= from;
    }

    if (!isInRange) continue;

    const { assignment, signals = [] } = range;
    let index = 0;
    for (const signal of signals) {
      const { id, delta, kind } = signal;
      if (SIGNAL_INCLUDED_KINDS.includes(kind as string)) {
        result.push({
          assignment: index === 0 ? assignment : '',
          delta,
          id,
          ...include?.(range),
        } as ExtractedSignal<T>);
        index++;
      }
    }
  }

  return result;
}
