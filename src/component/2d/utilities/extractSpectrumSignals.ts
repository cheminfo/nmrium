import type { Range, Signal1D } from '@zakodium/nmr-types';
import type { Spectrum1D } from '@zakodium/nmrium-core';
import { signalKindsToInclude } from 'nmr-processing';

export type ExtractedSignal<T> = Signal1D & T;

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

    const { signals = [] } = range;
    let index = 0;
    for (const signal of signals) {
      const { kind } = signal;
      if (kind && signalKindsToInclude.has(kind)) {
        result.push({
          ...signal,
          assignment: index === 0 ? signal.assignment : '',
          ...include?.(range),
        } as ExtractedSignal<T>);
        index++;
      }
    }
  }

  return result;
}
