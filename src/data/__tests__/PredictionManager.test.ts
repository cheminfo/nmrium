import type { Logger } from 'cheminfo-types';
import type { PredictionBase2D } from 'nmr-processing';
import { expect, test, vi } from 'vitest';

import type { PredictionOptions } from '../PredictionManager.js';
import {
  generateSpectra,
  getDefaultPredictionOptions,
  getEmpty2DExperiments,
  isEmpty2DPrediction,
} from '../PredictionManager.js';

function createLogger() {
  const warn = vi.fn();
  const logger = {
    warn,
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  } as unknown as Logger;
  return { logger, warn };
}

function hmbcOnlyOptions(): PredictionOptions {
  const options = getDefaultPredictionOptions();
  options.spectra = {
    proton: false,
    carbon: false,
    cosy: false,
    hsqc: false,
    hmbc: true,
  };
  return options;
}

function emptyHmbcPrediction(): PredictionBase2D {
  return {
    joinedSignals: [],
    signals: [],
    zones: [],
    nuclei: ['1H', '13C'],
  };
}

function hmbcPredictionWithOneSignal(): PredictionBase2D {
  return {
    joinedSignals: [],
    nuclei: ['1H', '13C'],
    signals: [
      {
        id: 'signal-1',
        x: { delta: 1.2, diaIDs: [], atoms: [] },
        y: { delta: 20, diaIDs: [], atoms: [] },
        peaks: [{ id: 'peak-1', x: 1.2, y: 20, z: 100 }],
      },
    ],
    zones: [],
  } as any;
}

test('an empty 2D prediction does not produce a spectrum', () => {
  const { logger } = createLogger();

  const spectra = generateSpectra(
    { hmbc: emptyHmbcPrediction() },
    hmbcOnlyOptions(),
    '#000000',
    logger,
  );

  expect(spectra).toHaveLength(0);
});

test('an empty 2D prediction warns that the spectrum is not simulated', () => {
  const { logger, warn } = createLogger();

  generateSpectra(
    { hmbc: emptyHmbcPrediction() },
    hmbcOnlyOptions(),
    '#000000',
    logger,
  );

  expect(warn).toHaveBeenCalledTimes(1);
  expect(warn).toHaveBeenCalledWith(
    expect.stringContaining('HMBC prediction is empty'),
  );
});

test('a 2D prediction with signals still produces a spectrum', () => {
  const { logger, warn } = createLogger();

  const spectra = generateSpectra(
    { hmbc: hmbcPredictionWithOneSignal() },
    hmbcOnlyOptions(),
    '#000000',
    logger,
  );

  expect(spectra).toHaveLength(1);
  expect(warn).not.toHaveBeenCalled();
});

test('a 2D prediction with signals still produces a spectrum even outside the 1d ranges', () => {
  const { logger, warn } = createLogger();
  const options = hmbcOnlyOptions();
  // the only signal is at 1.2 ppm, far outside the requested 100-200 ppm window:
  // signals2DToZ still writes a peak, so the matrix is not all zero and the
  // spectrum stays renderable
  options['1d']['1H'] = { from: 100, to: 200 };

  const spectra = generateSpectra(
    { hmbc: hmbcPredictionWithOneSignal() },
    options,
    '#000000',
    logger,
  );

  expect(spectra).toHaveLength(1);
  expect(warn).not.toHaveBeenCalled();
});

test('isEmpty2DPrediction distinguishes empty from populated predictions', () => {
  expect(isEmpty2DPrediction(emptyHmbcPrediction())).toBe(true);
  expect(isEmpty2DPrediction(hmbcPredictionWithOneSignal())).toBe(false);
  // zones without signals also produce an all-zero matrix, so they are empty too
  expect(
    isEmpty2DPrediction({
      joinedSignals: [],
      signals: [],
      zones: [{ id: 'zone-1', x: { from: 1, to: 2 }, y: { from: 10, to: 20 } }],
      nuclei: ['1H', '13C'],
    } as unknown as PredictionBase2D),
  ).toBe(true);
});

test('getEmpty2DExperiments reports the dropped 2D experiments only', () => {
  expect(getEmpty2DExperiments({ hmbc: emptyHmbcPrediction() })).toStrictEqual([
    'hmbc',
  ]);
  expect(
    getEmpty2DExperiments({
      hmbc: hmbcPredictionWithOneSignal(),
      proton: { joinedSignals: [], signals: [] } as any,
    }),
  ).toStrictEqual([]);
});
