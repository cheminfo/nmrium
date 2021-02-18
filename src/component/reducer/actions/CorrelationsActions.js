import { current, original } from 'immer';
// eslint-disable-next-line import/no-extraneous-dependencies
import { CorrelationManager } from 'nmr-correlation';

function build(spectra, options, values) {
  return CorrelationManager.build(spectra, options, values);
}

function handleUpdateCorrelations(draft) {
  const state = current(draft);
  const { data: spectra, correlations } = state;
  draft.correlations = build(
    spectra,
    correlations.options,
    correlations.values,
  );
}

function handleSetMF(draft, payload) {
  const state = original(draft);
  const { data: spectra, correlations } = state;
  const { mf } = payload;
  if (correlations.options.mf === '' || correlations.options.mf !== mf) {
    draft.correlations = build(spectra, { ...correlations.options, mf }, []);
  }
}

function handleSetTolerance(draft, payload) {
  const state = original(draft);
  const { data: spectra, correlations } = state;
  const { tolerance } = payload;
  draft.correlations = build(
    spectra,
    { ...correlations.options, tolerance },
    correlations.values,
  );
}

function handleSetCorrelation(draft, payload) {
  const state = original(draft);
  const { correlations } = state;
  const { id, correlation } = payload;
  draft.correlations = CorrelationManager.setCorrelation(
    correlations,
    id,
    correlation,
  );
  handleUpdateCorrelations(draft);
}

function handleSetCorrelations(draft, payload) {
  const { ids, correlations } = payload;
  ids.forEach((id, i) => handleSetCorrelation(draft, id, correlations[i]));
}

export {
  handleUpdateCorrelations,
  handleSetCorrelation,
  handleSetCorrelations,
  handleSetMF,
  handleSetTolerance,
};
