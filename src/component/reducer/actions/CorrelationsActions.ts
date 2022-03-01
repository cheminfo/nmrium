import { original, Draft } from 'immer';
import lodashCloneDeep from 'lodash/cloneDeep';
import {
  buildCorrelationData,
  setCorrelation,
  Tolerance,
  Options as CorrelationOptions,
  Correlation,
  Spectra,
  Values as CorrelationValues,
} from 'nmr-correlation';

import { Datum1D } from '../../../data/types/data1d';
import { Datum2D } from '../../../data/types/data2d';
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
  draft.correlations = buildCorrelationData(spectra as Spectra, {
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
    draft.correlations = buildCorrelationData(spectra as Spectra, {
      ...correlations.options,
      mf,
      values: lodashCloneDeep(correlations.values),
    });
  }
}

function handleSetTolerance(
  draft: Draft<State>,
  payload: { tolerance: Tolerance },
) {
  const state = original(draft) as State;
  const { data: spectra, correlations } = state;
  const { tolerance } = payload;
  draft.correlations = buildCorrelationData(spectra as Spectra, {
    ...correlations.options,
    tolerance,
    values: lodashCloneDeep(correlations.values),
  });
}

function handleSetCorrelation(
  draft: Draft<State>,
  payload: {
    id: string;
    correlation: Correlation;
    options: CorrelationOptions;
  },
) {
  const state = original(draft) as State;
  const { correlations } = state;
  const { id, correlation, options } = payload;
  draft.correlations = setCorrelation(correlations, id, correlation);
  if (options) {
    draft.correlations = {
      ...draft.correlations,
      options: { ...draft.correlations.options, ...options },
    };
  }
  handleUpdateCorrelations(draft);
}

function handleSetCorrelations(
  draft: Draft<State>,
  payload: {
    correlations: CorrelationValues;
    options: CorrelationOptions;
  },
) {
  const { correlations, options } = payload;
  const state = original(draft) as State;
  let correlationsData = lodashCloneDeep(state.correlations);
  correlations.forEach((correlation) => {
    correlationsData = setCorrelation(
      correlationsData,
      correlation.id,
      correlation,
    );
  });
  draft.correlations = correlationsData;
  if (options) {
    draft.correlations = {
      ...draft.correlations,
      options: { ...draft.correlations.options, ...options },
    };
  }
  handleUpdateCorrelations(draft);
}

function handleDeleteCorrelation(
  draft: Draft<State>,
  payload: { correlation: Correlation; assignmentData },
) {
  const { correlation, assignmentData } = payload;
  // delete all signals linked to the correlation
  correlation.link.forEach((link) => {
    const spectrum = findSpectrum(draft.data, link.experimentID, false);
    if (spectrum) {
      if (spectrum.info.dimension === 1) {
        const range = findRange(spectrum as Datum1D, link.signal.id);
        const signal = findSignal1D(spectrum as Datum1D, link.signal.id);
        handleDeleteSignal1D(draft, {
          payload: {
            spectrum,
            range,
            signal,
            assignmentData,
          },
        });
      } else if (spectrum.info.dimension === 2) {
        const zone = findZone(spectrum as Datum2D, link.signal.id);
        const signal = findSignal2D(spectrum as Datum2D, link.signal.id);
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
  });
}

export {
  handleDeleteCorrelation,
  handleSetCorrelation,
  handleSetCorrelations,
  handleSetMF,
  handleSetTolerance,
  handleUpdateCorrelations,
};
