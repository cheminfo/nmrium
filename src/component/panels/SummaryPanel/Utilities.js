import lodash from 'lodash';

import { ErrorColors, Errors } from './CorrelationTable/Constants';

const addToExperiments = (
  experiments,
  experimentsType,
  type,
  checkAtomType,
  experimentKey,
) => {
  const _experiments = lodash
    .get(experiments, `${type}`, []) // don't consider DEPT etc. here
    .filter((_experiment) => {
      const hasValues =
        lodash.get(
          _experiment,
          type.includes('1D') ? 'ranges.values' : 'zones.values',
          [],
        ).length > 0;
      return checkAtomType === true
        ? getAtomType(_experiment.info.nucleus) === experimentKey && hasValues
        : hasValues;
    });

  if (_experiments.length > 0) {
    experimentsType[experimentKey] = _experiments;
  }
  return _experiments;
};

const getAtomType = (nucleus) => nucleus.split(/\d+/)[1];

const getLabelColor = (correlations, correlation) => {
  const error = lodash.get(
    correlations,
    `state.${correlation.getAtomType()}.error`,
    null,
  );
  if (error) {
    for (let errorIndex in Errors) {
      if (
        ErrorColors[errorIndex].key !== 'incomplete' && // do not consider this for a single atom
        lodash
          .get(error, `${ErrorColors[errorIndex].key}`, [])
          .some(
            (index) =>
              correlations.values[index].getID() === correlation.getID(),
          )
      ) {
        return ErrorColors[errorIndex].color;
      }
    }
  }

  return null;
};

export { addToExperiments, getAtomType, getLabelColor };
