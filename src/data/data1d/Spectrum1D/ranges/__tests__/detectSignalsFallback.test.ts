import type { DataXY, Logger } from 'cheminfo-types';
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
const NOISE = 1;
const FWHM_TO_SIGMA = 2 * Math.sqrt(2 * Math.LN2);

function buildSpectrum(peaks: Array<{ x: number; y: number; width: number }>) {
  const dx = (TO - FROM) / (NB_POINTS - 1);
  const x = new Float64Array(NB_POINTS);
  const y = new Float64Array(NB_POINTS);
  for (let i = 0; i < NB_POINTS; i++) {
    x[i] = FROM + i * dx;
  }
  for (const peak of peaks) {
    const sigma = peak.width / FWHM_TO_SIGMA;
    for (let i = 0; i < NB_POINTS; i++) {
      const z = (x[i] - peak.x) / sigma;
      y[i] += peak.y * Math.exp(-0.5 * z * z);
    }
  }

  let seed = 123_456_789;
  for (let i = 0; i < NB_POINTS; i++) {
    seed = (seed * 1_103_515_245 + 12_345) % 2_147_483_648;
    y[i] += ((seed / 2_147_483_648) * 2 - 1) * NOISE;
  }

  return { x, y } as DataXY<Float64Array>;
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
