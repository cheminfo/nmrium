import { original, Draft } from 'immer';
import lodashCloneDeep from 'lodash/cloneDeep';
import { buildCorrelationData, setCorrelation, Types } from 'nmr-correlation';

import { State } from '../Reducer';

function handleUpdateCorrelations(draft: Draft<State>) {
  const { data: spectra, correlations } = draft;
  draft.correlations = buildCorrelationData(
    spectra as Types.Spectra,
    correlations.options,
    lodashCloneDeep(correlations.values),
  );
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

export {
  handleUpdateCorrelations,
  handleSetCorrelation,
  handleSetCorrelations,
  handleSetMF,
  handleSetTolerance,
};
