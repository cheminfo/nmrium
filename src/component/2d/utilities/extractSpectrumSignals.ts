import type { Range, Signal1D } from '@zakodium/nmr-types';
import type { Spectrum1D } from '@zakodium/nmrium-core';
import { signalKindsToInclude } from 'nmr-processing';

export type ExtractedSignal<T> = Signal1D & T;

interface ExtractSpectrumSignalsOptions<T> {
  from?: number;
  to?: number;
  include?: (range: Range) => T;
  onlyFirstSignal?: boolean;
}

function isRangeInBounds(range: Range, from?: number, to?: number): boolean {
  if (typeof from === 'number' && typeof to === 'number') {
    return range.from <= to && range.to >= from;
  }
  if (typeof to === 'number') {
    return range.to <= to;
  }
  if (typeof from === 'number') {
    return range.from >= from;
  }
  return true;
}

export function extractSpectrumSignals<T extends object = object>(
  spectrum: Spectrum1D,
  options: ExtractSpectrumSignalsOptions<T> = {},
): Array<ExtractedSignal<T>> {
  const { from, to, include, onlyFirstSignal = false } = options;

  const ranges = spectrum?.ranges?.values;
  if (!Array.isArray(ranges) || ranges.length === 0) {
    return [];
  }

  const result: Array<ExtractedSignal<T>> = [];

  for (const range of ranges) {
    if (!isRangeInBounds(range, from, to)) continue;

    const { signals = [] } = range;
    let includedCount = 0;

    for (const signal of signals) {
      const { kind, assignment } = signal;
      if (!kind || !signalKindsToInclude.has(kind)) continue;

      const keepAssignment = !onlyFirstSignal || includedCount === 0;

      result.push({
        ...signal,
        assignment: keepAssignment ? assignment : '',
        ...include?.(range),
      } as ExtractedSignal<T>);

      includedCount++;
    }
  }

  return result;
}
