import type { Logger } from 'cheminfo-types';
import { generateSpectrum } from 'spectrum-generator';
import { describe, expect, it, vi } from 'vitest';

import detectSignals from '../detectSignals.js';

// The multiplet analysis is forced to return nothing so that the fallback of
// `detectSignals` is exercised on its own, without depending on the ability of
// the peak picking to find a local maximum in the range.
vi.mock('../detectSignalsByMultipletAnalysis.js', () => ({
  detectSignalsByMultipletAnalysis: vi.fn(() => []),
}));

const FREQUENCY = 400;
const FROM = -0.5;
const TO = 10.5;
const NB_POINTS = 64 * 1024;
function buildSpectrum(peaks: Array<{ x: number; y: number; width: number }>) {
  return generateSpectrum(peaks, {
    generator: { from: FROM, to: TO, nbPoints: NB_POINTS },
    noise: { distribution: 'uniform', percent: 0.2, seed: 123_456_789 },
  });
}

describe('detectSignals fallback', () => {
  it('reports the point of maximum intensity when nothing can be detected', () => {
    const spectrum = buildSpectrum([{ x: 8.265, y: 1000, width: 0.002 }]);
    const warn = vi.fn();
    const signals = detectSignals(spectrum, {
      from: 8.26,
      to: 8.27,
      frequency: FREQUENCY,
      nucleus: '1H',
      logger: { warn } as unknown as Logger,
    }) as Array<{
      delta: number;
      multiplicity?: string;
      kind?: string;
      peaks?: unknown[];
    }>;

    expect(signals).toHaveLength(1);
    expect(signals[0].delta).toBeCloseTo(8.265, 2);
    expect(signals[0].multiplicity).toBe('');
    expect(signals[0].kind).toBe('signal');
    expect(signals[0].peaks).toHaveLength(0);
    // the user is informed that the multiplicity could not be determined
    expect(warn).toHaveBeenCalledOnce();
  });

  it('stays empty when the range only contains noise', () => {
    const spectrum = buildSpectrum([{ x: 8.265, y: 1000, width: 0.002 }]);
    const warn = vi.fn();
    const signals = detectSignals(spectrum, {
      from: 5.1,
      to: 5.12,
      frequency: FREQUENCY,
      nucleus: '1H',
      logger: { warn } as unknown as Logger,
    });

    expect(signals).toHaveLength(0);
    expect(warn).not.toHaveBeenCalled();
  });
});
