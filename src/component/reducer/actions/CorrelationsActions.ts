import { isSpectrum1D, isSpectrum2D } from '@zakodium/nmrium-core';
import type { Draft } from 'immer';
import { current, original } from 'immer';
import lodashCloneDeep from 'lodash/cloneDeep.js';
import type {
  Correlation,
  CorrelationBuildOptions,
  CorrelationTolerance,
  CorrelationValues,
} from 'nmr-processing';
import { correlationApi } from 'nmr-processing';

import {
  findRange,
  findSignal1D,
  findSignal2D,
  findSpectrum,
  findZone,
} from '../../../data/utilities/FindUtilities.js';
import type { State } from '../Reducer.js';
import type { ActionType } from '../types/ActionType.js';

import { deleteSignal1D } from './RangesActions.js';
import { deleteSignal2D } from './ZonesActions.js';

type SetMFAction = ActionType<'SET_CORRELATIONS_MF', { mf: string }>;
type SetToleranceAction = ActionType<
  'SET_CORRELATIONS_TOLERANCE',
  { tolerance: CorrelationTolerance }
>;
type SetCorrelationAction = ActionType<
  'SET_CORRELATION',
  {
    id: string;
    correlation: Correlation;
    options?: CorrelationBuildOptions;
  }
>;
type SetCorrelationsAction = ActionType<
  'SET_CORRELATIONS',
  {
    correlations: CorrelationValues;
    options: CorrelationBuildOptions;
  }
>;
type DeleteCorrelationAction = ActionType<
  'DELETE_CORRELATION',
  { correlation: Correlation }
>;

export type CorrelationsActions =
  | SetMFAction
  | SetToleranceAction
  | SetCorrelationAction
  | SetCorrelationsAction
  | DeleteCorrelationAction;

function handleUpdateCorrelations(
  draft: Draft<State>,
  options?: CorrelationBuildOptions,
) {
  const { data: spectra, correlations } = current(draft);
  draft.correlations = correlationApi.buildCorrelationData(spectra, {
    ...correlations?.options,
    ...options,
    values: lodashCloneDeep(correlations?.values),
  });
}

//action
function handleSetMF(draft: Draft<State>, action: SetMFAction) {
  const { correlations } = original(draft);
  const { mf } = action.payload;
  // update of correlation data only if the molecular formula is not empty and not equal to the current one
  if (correlations.options.mf === '' || correlations.options.mf !== mf) {
    handleUpdateCorrelations(draft, { mf });
  }
}

//action
function handleSetTolerance(draft: Draft<State>, action: SetToleranceAction) {
  const { tolerance } = action.payload;
  handleUpdateCorrelations(draft, { tolerance });
}

//action
function handleSetCorrelation(
  draft: Draft<State>,
  action: SetCorrelationAction,
) {
  const { correlations } = original(draft);
  const { id, correlation, options } = action.payload;
  // replace the existing correlation with the new one but do not update the entire correlation data here
  draft.correlations = correlationApi.setCorrelation(
    correlations,
    id,
    correlation,
  );
  // update the entire correlation data including the replaced correlation
  handleUpdateCorrelations(draft, options);
}

//action
function handleSetCorrelations(
  draft: Draft<State>,
  action: SetCorrelationsAction,
) {
  const { correlations, options } = action.payload;
  const state = original(draft);
  let correlationsData = lodashCloneDeep(state.correlations);
  // apply each correlation update to the cloned correlations data
  for (const correlation of correlations) {
    correlationsData = correlationApi.setCorrelation(
      correlationsData,
      correlation.id,
      correlation,
    );
  }
  draft.correlations = correlationsData;
  // update the entire correlation data including the replaced correlations
  handleUpdateCorrelations(draft, options);
}

//action
function handleDeleteCorrelation(
  draft: Draft<State>,
  action: DeleteCorrelationAction,
) {
  const { correlation } = action.payload;
  // delete all signals linked to the correlation
  for (const link of correlation.link) {
    const spectrum = findSpectrum(draft.data, link.experimentID, false);
    if (isSpectrum1D(spectrum)) {
      const range = findRange(spectrum, link.signal.id);
      const signal = findSignal1D(spectrum, link.signal.id);
      if (range && signal) {
        deleteSignal1D(draft, {
          spectrumId: spectrum.id,
          rangeId: range.id,
          signalId: signal.id,
        });
      }
    } else if (isSpectrum2D(spectrum)) {
      const zone = findZone(spectrum, link.signal.id);
      const signal = findSignal2D(spectrum, link.signal.id);
      if (zone && signal) {
        deleteSignal2D(draft, {
          spectrumId: spectrum.id,
          zone: original(zone),
          signalId: signal.id,
        });
      }
    }
  }
}

export {
  handleDeleteCorrelation,
  handleSetCorrelation,
  handleSetCorrelations,
  handleSetMF,
  handleSetTolerance,
  handleUpdateCorrelations,
};
