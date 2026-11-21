import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Spectrum2D } from '@zakodium/nmrium-core';
import { expect, test } from 'vitest';

import { initiateDatum2D } from '../Spectrum2D/initiateDatum2D.js';
import { detectZonesManual } from '../Spectrum2D/zones/detectZonesManual.js';
import { getDetectionZones } from '../Spectrum2D/zones/getDetectionZones.js';

// Simulated COSY with two diagonal peaks, centred at 0.8/0.8 and 1/1 ppm.
const spectrum: Spectrum2D = initiateDatum2D(
  JSON.parse(
    readFileSync(
      join(
        import.meta.dirname,
        '../../../../public/data/tests/simulated2D/simulated.json',
      ),
      'utf8',
    ),
  ).data.spectra[0],
);

const detectionOptions = { thresholdFactor: 1, maxPercentCutOff: 0.03 };

test('auto zones are centred on the peaks over the whole spectrum', () => {
  const zones = getDetectionZones(spectrum, {
    ...detectionOptions,
    selectedZone: { fromX: 0.6, toX: 1.2, fromY: 0.6, toY: 1.2 },
  });

  const centres = zones
    .map(({ signals }) => [signals[0].x.delta, signals[0].y.delta])
    .toSorted((a, b) => a[0] - b[0]);

  expect(centres).toHaveLength(2);
  expect(centres[0][0]).toBeCloseTo(0.8, 6);
  expect(centres[0][1]).toBeCloseTo(0.8, 6);
  expect(centres[1][0]).toBeCloseTo(1, 6);
  expect(centres[1][1]).toBeCloseTo(1, 6);
});

test('auto zones of a symmetric peak are symmetric in a zoomed domain', () => {
  const zones = getDetectionZones(spectrum, {
    ...detectionOptions,
    selectedZone: { fromX: 0.99, toX: 1.01, fromY: 0.982, toY: 1.012 },
  });

  expect(zones).toHaveLength(1);

  const { x, y, signals } = zones[0];

  expect(y.from).toBeCloseTo(x.from, 6);
  expect(y.to).toBeCloseTo(x.to, 6);
  expect(signals[0].y.delta).toBeCloseTo(signals[0].x.delta, 6);
});

test('a manual zone keeps the drawn boundaries in ascending order', () => {
  const [zone] = detectZonesManual(spectrum, {
    ...detectionOptions,
    selectedZone: { fromX: 1.01, toX: 0.99, fromY: 1.01, toY: 0.99 },
  });

  expect([zone.x.from, zone.x.to]).toStrictEqual([0.99, 1.01]);
  expect([zone.y.from, zone.y.to]).toStrictEqual([0.99, 1.01]);
});
