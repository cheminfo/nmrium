import type { Spectrum1D } from '@zakodium/nmrium-core';
import type { FifoLogger } from 'fifo-logger';
import type { Draft } from 'immer';
import { createDraft, finishDraft } from 'immer';
import { expect, test, vi } from 'vitest';

import { getDefaultPredictionOptions } from '../../../../data/PredictionManager.js';
import { handlePredictSpectraFromMolecule } from '../MoleculeActions.js';

const molfile = [
  'methane',
  '  test',
  '',
  '  1  0  0  0  0  0  0  0  0  0999 V2000',
  '    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0',
  'M  END',
].join('\n');

type PredictAction = Parameters<typeof handlePredictSpectraFromMolecule>[1];
type PredictDraft = Parameters<typeof handlePredictSpectraFromMolecule>[0];

function createDraftState() {
  return {
    data: [],
    molecules: [],
    usedColors: { '1d': [], '2d': [] },
    toolOptions: {
      data: { predictionIndex: 0 },
      selectedOptionPanel: null,
    },
    view: {
      molecules: {},
      predictions: {},
      spectra: { activeSpectra: {}, activeTab: null },
      spectraContourLevels: {},
    },
    zoom: { history: {} },
  } as unknown as PredictDraft; // the stub state is intentionally a partial State
}

function createPredictionAction(action: 'add' | 'save') {
  const warn = vi.fn();
  const logger = {
    warn,
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  } as unknown as FifoLogger;
  const options = getDefaultPredictionOptions();
  options.spectra.hmbc = true;
  return {
    action: {
      type: 'PREDICT_SPECTRA',
      payload: {
        logger,
        options,
        predictedSpectra: {
          hmbc: {
            joinedSignals: [],
            signals: [],
            zones: [],
            nuclei: ['1H', '13C'],
          },
        },
        molecule: { id: 'mol-1', label: 'M', molfile },
        action,
      },
    } as unknown as PredictAction,
    warn,
  };
}

/**
 * run the handler the same way the reducer does: inside an immer draft
 */
function runHandler(draftState: PredictDraft, action: PredictAction) {
  const draft = createDraft(draftState);
  handlePredictSpectraFromMolecule(draft, action);
  return finishDraft(draft);
}

test('an empty 2D prediction adds no spectrum and no contour levels', () => {
  const draftState = createDraftState();
  const { action, warn } = createPredictionAction('add');

  let draft: PredictDraft | undefined;
  expect(() => {
    draft = runHandler(draftState, action);
  }).not.toThrow();

  expect(draft?.data).toHaveLength(0);
  expect(draft?.view.spectraContourLevels).toEqual({});
  // the prediction reference is not replaced by an empty prediction
  expect(draft?.view.predictions).toEqual({});
  expect(warn).toHaveBeenCalled();
});

test('an all-empty save re-prediction keeps the previously saved spectra', () => {
  const draftState = createDraftState();
  // minimal Spectrum1D stand-in: the handler chain only touches the fields below
  const oldSpectrum = {
    id: 'old-1',
    info: { nucleus: '1H', isFid: false, dimension: 1 },
    display: { isRealSpectrumVisible: true, isVisible: true },
    filters: [],
    data: {
      x: Float64Array.from([0, 1]),
      re: Float64Array.from([0, 0]),
      im: Float64Array.from([0, 0]),
    },
    originalData: {
      x: Float64Array.from([0, 1]),
      re: Float64Array.from([0, 0]),
      im: Float64Array.from([0, 0]),
    },
    ranges: {
      values: [],
      options: { sumAuto: false, isSumConstant: false, sum: 100 },
    },
    integrals: {
      values: [],
      options: { sumAuto: false, isSumConstant: false, sum: 100 },
    },
  } as unknown as Draft<Spectrum1D>;
  draftState.data.push(oldSpectrum);
  draftState.molecules.push({
    id: 'mol-1',
    label: 'M',
    molfile,
    mf: 'CH4',
    em: 16.043,
    mw: 16.043,
    svg: '',
    atoms: { C: 1, H: 4 },
  });
  draftState.view.predictions['mol-1'] = ['old-1'];
  const { action } = createPredictionAction('save');

  let draft: PredictDraft | undefined;
  expect(() => {
    draft = runHandler(draftState, action);
  }).not.toThrow();

  expect(draft?.data).toHaveLength(1);
  expect(draft?.data[0].id).toBe('old-1');
  expect(draft?.view.predictions['mol-1']).toEqual(['old-1']);
  expect(draft?.view.spectraContourLevels).toEqual({});
});
