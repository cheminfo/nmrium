import type { Draft } from 'immer';
import { original } from 'immer';
import lodashCloneDeep from 'lodash/cloneDeep.js';
import type {
  Correlation,
  Options as CorrelationOptions,
  Spectrum,
  Tolerance,
  Values as CorrelationValues,
} from 'nmr-correlation';
import { buildCorrelationData, setCorrelation } from 'nmr-correlation';

import { isSpectrum1D } from '../../../data/data1d/Spectrum1D/index.js';
import { isSpectrum2D } from '../../../data/data2d/Spectrum2D/index.js';
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
  { tolerance: Tolerance }
>;
type SetCorrelationAction = ActionType<
  'SET_CORRELATION',
  {
    id: string;
    correlation: Correlation;
    options?: CorrelationOptions;
  }
>;
type SetCorrelationsAction = ActionType<
  'SET_CORRELATIONS',
  {
    correlations: CorrelationValues;
    options: CorrelationOptions;
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

function handleUpdateCorrelations(draft: Draft<State>) {
  const { data: spectra, correlations } = draft;
  draft.correlations = buildCorrelationData(spectra as Spectrum, {
    ...correlations.options,
    values: lodashCloneDeep(correlations.values),
  });
}

//action
function handleSetMF(draft: Draft<State>, action: SetMFAction) {
  const state = original(draft) as State;
  const { data: spectra, correlations } = state;
  const { mf } = action.payload;
  // update of correlation data is needed only if the following is true
  if (correlations.options.mf === '' || correlations.options.mf !== mf) {
    draft.correlations = buildCorrelationData(spectra, {
      ...correlations.options,
      mf,
      values: lodashCloneDeep(correlations.values),
    });
  }
}

//action
function handleSetTolerance(draft: Draft<State>, action: SetToleranceAction) {
  const state = original(draft) as State;
  const { data: spectra, correlations } = state;
  const { tolerance } = action.payload;
  draft.correlations = buildCorrelationData(spectra, {
    ...correlations.options,
    tolerance,
    values: lodashCloneDeep(correlations.values),
  });
}

//action
function handleSetCorrelation(
  draft: Draft<State>,
  action: SetCorrelationAction,
) {
  const state = original(draft) as State;
  const { correlations } = state;
  const { id, correlation, options } = action.payload;
  draft.correlations = setCorrelation(correlations, id, correlation);
  if (options) {
    draft.correlations = {
      ...draft.correlations,
      options: { ...draft.correlations.options, ...options },
    };
  }
  handleUpdateCorrelations(draft);
}

//action
function handleSetCorrelations(
  draft: Draft<State>,
  action: SetCorrelationsAction,
) {
  const { correlations, options } = action.payload;
  const state = original(draft) as State;
  let correlationsData = lodashCloneDeep(state.correlations);
  for (const correlation of correlations) {
    correlationsData = setCorrelation(
      correlationsData,
      correlation.id,
      correlation,
    );
  }
  draft.correlations = correlationsData;
  if (options) {
    draft.correlations = {
      ...draft.correlations,
      options: { ...draft.correlations.options, ...options },
    };
  }
  handleUpdateCorrelations(draft);
}

//action
function handleDeleteCorrelation(
  draft: Draft<State>,
  action: DeleteCorrelationAction,
) {
  const { correlation } = action.payload;
  // delete all signals linked to the correlation
  for (const link of correlation.links) {
    const spectrum = findSpectrum(draft.data, link.experimentID, false);
    if (isSpectrum1D(spectrum)) {
      const range = findRange(spectrum, link.signal.id);
      const signal = findSignal1D(spectrum, link.signal.id);
      if (range && signal) {
        deleteSignal1D(draft, {
          spectrumId: spectrum.id,
          range,
          signalId: signal.id,
        });
      }
    } else if (isSpectrum2D(spectrum)) {
      const zone = findZone(spectrum, link.signal.id);
      const signal = findSignal2D(spectrum, link.signal.id);
      if (zone && signal) {
        deleteSignal2D(draft, {
          spectrumId: spectrum.id,
          zone,
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
