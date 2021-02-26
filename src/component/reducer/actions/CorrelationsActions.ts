import { original, Draft } from 'immer';
import { CorrelationManager } from 'nmr-correlation';

import { State } from '../Reducer';

function build(spectra, options, values) {
  return CorrelationManager.build(spectra, options, values);
}

function handleUpdateCorrelations(draft: Draft<State>) {
  const { data: spectra, correlations } = draft;
  draft.correlations = build(
    spectra,
    correlations.options,
    correlations.values,
  );
}

function handleSetMF(draft: Draft<State>, payload) {
  const state = original(draft) as State;
  const { data: spectra, correlations } = state;
  const { mf } = payload;
  if (correlations.options.mf === '' || correlations.options.mf !== mf) {
    draft.correlations = build(spectra, { ...correlations.options, mf }, []);
  }
}

function handleSetTolerance(draft: Draft<State>, payload) {
  const state = original(draft) as State;
  const { data: spectra, correlations } = state;
  const { tolerance } = payload;
  draft.correlations = build(
    spectra,
    { ...correlations.options, tolerance },
    correlations.values,
  );
}

function handleSetCorrelation(draft: Draft<State>, payload) {
  const state = original(draft) as State;
  const { correlations } = state;
  const { id, correlation } = payload;
  draft.correlations = CorrelationManager.setCorrelation(
    correlations,
    id,
    correlation,
  );
  handleUpdateCorrelations(draft);
}

function handleSetCorrelations(draft: Draft<State>, payload) {
  const { ids, correlations } = payload;
  ids.forEach((id, i) =>
    handleSetCorrelation(draft, {
      id,
      correlation: correlations[i],
    }),
  );
}

export {
  handleUpdateCorrelations,
  handleSetCorrelation,
  handleSetCorrelations,
  handleSetMF,
  handleSetTolerance,
};
