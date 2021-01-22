import lodash from 'lodash';

import { ErrorColors, Errors } from './CorrelationTable/Constants';

function addToExperiments(
  experiments,
  experimentsType,
  type,
  checkAtomType,
  experimentKey,
) {
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
}

function getAtomType(nucleus) {
  return nucleus.split(/\d+/)[1];
}

function getLabelColor(correlationData, correlation) {
  const error = lodash.get(
    correlationData,
    `state.${correlation.getAtomType()}.error`,
    null,
  );
  if (error) {
    for (let errorIndex in Errors) {
      if (
        ErrorColors[errorIndex].key !== 'incomplete' && // do not consider this for a single atom type
        (ErrorColors[errorIndex].key === 'notAttached' ||
          ErrorColors[errorIndex].key === 'ambiguousAttachment') &&
        lodash
          .get(error, `${ErrorColors[errorIndex].key}`, [])
          .some(
            (index) =>
              correlationData.values[index].getID() === correlation.getID(),
          )
      ) {
        return ErrorColors[errorIndex].color;
      }
    }
  }

  return null;
}

export { addToExperiments, getAtomType, getLabelColor };
