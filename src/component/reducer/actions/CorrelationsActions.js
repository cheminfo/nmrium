import { CorrelationManager } from 'nmr-correlation';

function handleUpdateCorrelations(
  draft,
  spectra,
  mf,
  tolerance,
  correlationsData,
) {
  draft.correlations = CorrelationManager.build(
    spectra,
    mf,
    tolerance,
    correlationsData,
  );
}

function handleSetCorrelation(draft, correlationsData, id, correlation) {
  draft.correlations = CorrelationManager.setCorrelation(
    correlationsData,
    id,
    correlation,
  );
}

function handleSetCorrelations(draft, correlationsData, ids, correlations) {
  if (ids.length === correlations.length) {
    ids.forEach((id, i) =>
      handleSetCorrelation(draft, correlationsData, id, correlations[i]),
    );
  }
}

export {
  handleUpdateCorrelations,
  handleSetCorrelation,
  handleSetCorrelations,
};
