import type { DataXY } from 'cheminfo-types';
import { rangesToXY } from 'nmr-processing';
import { describe, expect, it } from 'vitest';

import detectSignals from '../detectSignals.js';

describe('lineBroadening', () => {
  it('simple x, re, im to 1 Hz exp.', () => {
    const from = 0.98;
    const to = 1.02;
    const frequency = 400;
    const { x, y } = rangesToXY(
      [
        {
          from,
          to,
          signals: [
            {
              delta: 1,
              multiplicity: 't',
              js: [{ coupling: 7.2, multiplicity: 't' }],
            },
          ],
        },
      ],
      { from: from - 0.02, to: to + 0.02, nbPoints: 512, frequency },
    );
    const result = detectSignals(
      { x: new Float64Array(x), y },
      { from, to, frequency, nucleus: '1H' },
    )[0];
    expect(result?.multiplicity).toBe('t');
    expect(result?.delta).toBeCloseTo(1, 3);
    expect(result?.js[0].coupling).toBeCloseTo(7.2, 2);
  });
});

const FREQUENCY = 400;
const FROM = -0.5;
const TO = 10.5;
const NB_POINTS = 64 * 1024;
const NOISE = 1;

interface Peak {
  x: number;
  /**
   * Peak height.
   */
  y: number;
  /**
   * Full width at half maximum, in ppm.
   */
  width: number;
}

/**
 * Full width at half maximum to gaussian sigma.
 */
const FWHM_TO_SIGMA = 2 * Math.sqrt(2 * Math.LN2);

/**
 * Synthetic spectrum with a deterministic noise floor, so that the fixtures
 * have a baseline like real data does (`median(|y|) > 0`).
 */
function buildSpectrum(peaks: Peak[]): DataXY<Float64Array> {
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

  return { x, y };
}

function getSignals(spectrum: DataXY<Float64Array>, from: number, to: number) {
  return detectSignals(spectrum, {
    from,
    to,
    frequency: FREQUENCY,
    nucleus: '1H',
  }) as Array<{ delta: number; multiplicity?: string; peaks?: unknown[] }>;
}

describe('signal detection inside a range (issue #4435)', () => {
  it('detects a signal in a narrow range', () => {
    const spectrum = buildSpectrum([
      { x: 8.265, y: 1000, width: 0.002 },
      { x: 3.32, y: 200, width: 0.003 },
    ]);
    const signals = getSignals(spectrum, 8.2625, 8.2675);
    expect(signals.length).toBeGreaterThanOrEqual(1);
    expect(signals[0].delta).toBeCloseTo(8.265, 2);
  });

  it('detects weak lines when they are the tallest point of their own range', () => {
    const spectrum = buildSpectrum([
      { x: 7.968, y: 50, width: 0.002 },
      { x: 7.972, y: 50, width: 0.002 },
    ]);
    const signals = getSignals(spectrum, 7.964, 7.975);
    expect(signals.length).toBeGreaterThanOrEqual(1);
  });

  it('detects the signals when the strongest point of the range is at its edge', () => {
    const spectrum = buildSpectrum([
      { x: 7.9595, y: 1000, width: 0.003 },
      { x: 7.968, y: 50, width: 0.002 },
      { x: 7.972, y: 50, width: 0.002 },
    ]);
    const signals = getSignals(spectrum, 7.962, 7.975);
    expect(signals.length).toBeGreaterThanOrEqual(1);
  });

  it.each([0.0005, 0.001, 0.002, 0.003, 0.005, 0.008, 0.01, 0.02])(
    'never leaves a range without signals when it contains a peak (width %f ppm)',
    (width) => {
      const spectrum = buildSpectrum([{ x: 8.265, y: 1000, width: 0.002 }]);
      const signals = getSignals(
        spectrum,
        8.265 - width / 2,
        8.265 + width / 2,
      );
      expect(signals.length).toBeGreaterThanOrEqual(1);
    },
  );

  it('keeps the multiplet analysis of a well resolved range', () => {
    const spectrum = buildSpectrum([
      { x: 8.256, y: 1000, width: 0.0015 },
      { x: 8.262, y: 2000, width: 0.0015 },
      { x: 8.268, y: 1000, width: 0.0015 },
    ]);
    const signals = getSignals(spectrum, 8.25, 8.27);
    expect(signals).toHaveLength(1);
    expect(signals[0].multiplicity).toBe('t');
    expect(signals[0].delta).toBeCloseTo(8.262, 2);
  });

  it('keeps a signal when the range only contains the flank of a broad peak', () => {
    // No local maximum inside the range: the detection must still report
    // something (peak picking, multiplet analysis or the fallback).
    const spectrum = buildSpectrum([{ x: 7.962, y: 1000, width: 0.02 }]);
    const signals = getSignals(spectrum, 7.964, 7.978);
    expect(signals.length).toBeGreaterThanOrEqual(1);
  });

  it('returns no signal for a range that only contains noise', () => {
    const spectrum = buildSpectrum([
      { x: 8.265, y: 1000, width: 0.002 },
      { x: 3.32, y: 200, width: 0.003 },
    ]);
    const signals = getSignals(spectrum, 5.1, 5.12);
    expect(signals).toHaveLength(0);
  });
});
