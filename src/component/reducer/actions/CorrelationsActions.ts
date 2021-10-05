import { original, Draft } from 'immer';
import lodashCloneDeep from 'lodash/cloneDeep';
import { buildCorrelationData, setCorrelation, Types } from 'nmr-correlation';

import { Datum1D } from '../../../data/data1d/Spectrum1D';
import { Datum2D } from '../../../data/data2d/Spectrum2D';
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
  draft.correlations = buildCorrelationData(spectra as Types.Spectra, {
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
    draft.correlations = buildCorrelationData(spectra as Types.Spectra, {
      ...correlations.options,
      mf,
      values: lodashCloneDeep(correlations.values),
    });
  }
}

function handleSetTolerance(
  draft: Draft<State>,
  payload: { tolerance: Types.Tolerance },
) {
  const state = original(draft) as State;
  const { data: spectra, correlations } = state;
  const { tolerance } = payload;
  draft.correlations = buildCorrelationData(spectra as Types.Spectra, {
    ...correlations.options,
    tolerance,
    values: lodashCloneDeep(correlations.values),
  });
}

function handleSetCorrelation(
  draft: Draft<State>,
  payload: { id: string; correlation: Types.Correlation },
) {
  const state = original(draft) as State;
  const { correlations } = state;
  const { id, correlation } = payload;
  draft.correlations = setCorrelation(correlations, id, correlation);
  handleUpdateCorrelations(draft);
}

function handleSetCorrelations(
  draft: Draft<State>,
  payload: { ids: Array<string>; correlations: Types.Values },
) {
  const { ids, correlations } = payload;
  ids.forEach((id, i) => {
    const { correlations: correlationsData } = draft;
    draft.correlations = setCorrelation(correlationsData, id, correlations[i]);
  });

  handleUpdateCorrelations(draft);
}

function handleDeleteCorrelation(
  draft: Draft<State>,
  payload: { correlation: Types.Correlation; assignmentData },
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
