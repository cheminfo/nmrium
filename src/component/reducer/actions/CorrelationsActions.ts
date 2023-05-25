/* eslint-disable @typescript-eslint/no-unused-vars */
import { original, Draft } from 'immer';
import lodashCloneDeep from 'lodash/cloneDeep';
import {
  buildCorrelationData,
  setCorrelation,
  Tolerance,
  Options as CorrelationOptions,
  Correlation,
  Spectrum,
  Values as CorrelationValues,
} from 'nmr-correlation';
import { Spectrum1D, Spectrum2D } from 'nmr-load-save';

import {
  findRange,
  findSignal1D,
  findSignal2D,
  findSpectrum,
  findZone,
} from '../../../data/utilities/FindUtilities';
import { State } from '../Reducer';

import { handleDeleteSignal as handleDeleteSignal1D } from './RangesActions';
import { handleDeleteSignal as handleDeleteSignal2D } from './ZonesActions';

function handleUpdateCorrelations(draft: Draft<State>) {
  const { data: spectra, correlations } = draft;
  draft.correlations = buildCorrelationData(spectra as Spectrum, {
    ...correlations.options,
    values: lodashCloneDeep(correlations.values),
  });
}

function handleSetMF(draft: Draft<State>, payload: { mf: string }) {
  const state = original(draft) as State;
  const { data: spectra, correlations } = state;
  const { mf } = payload;
  // update of correlation data is needed only if the following is true
  if (correlations.options.mf === '' || correlations.options.mf !== mf) {
    draft.correlations = buildCorrelationData(spectra, {
      ...correlations.options,
      mf,
      values: lodashCloneDeep(correlations.values),
    });
  }
}
// Todo define interface
// { tolerance: Tolerance }
function handleSetTolerance(draft: Draft<State>, action) {
  const state = original(draft) as State;
  const { data: spectra, correlations } = state;
  const { tolerance } = action.payload;
  draft.correlations = buildCorrelationData(spectra, {
    ...correlations.options,
    tolerance,
    values: lodashCloneDeep(correlations.values),
  });
}
// Todo define interface
// {
//   id: string;
//   correlation: Correlation;
//   options: CorrelationOptions;
// }
function handleSetCorrelation(draft: Draft<State>, action) {
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

// Todo define interface
// {
//   correlations: CorrelationValues;
//   options: CorrelationOptions;
// }

function handleSetCorrelations(draft: Draft<State>, action) {
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

// Todo define interface
// { correlation: Correlation; assignmentData }
function handleDeleteCorrelation(draft: Draft<State>, action) {
  const { correlation, assignmentData } = action.payload;
  // delete all signals linked to the correlation
  for (const link of correlation.links) {
    const spectrum = findSpectrum(draft.data, link.experimentID, false);
    if (spectrum) {
      if (spectrum.info.dimension === 1) {
        const range = findRange(spectrum as Spectrum1D, link.signal.id);
        const signal = findSignal1D(spectrum as Spectrum1D, link.signal.id);
        handleDeleteSignal1D(draft, {
          payload: {
            spectrum,
            range,
            signal,
            assignmentData,
          },
        });
      } else if (spectrum.info.dimension === 2) {
        const zone = findZone(spectrum as Spectrum2D, link.signal.id);
        const signal = findSignal2D(spectrum as Spectrum2D, link.signal.id);
        handleDeleteSignal2D(draft, {
          payload: {
            spectrum,
            zone,
            signal,
            assignmentData,
          },
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
