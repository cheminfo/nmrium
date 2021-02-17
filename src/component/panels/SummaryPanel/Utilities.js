import lodash from 'lodash';

import { ErrorColors, Errors } from './CorrelationTable/Constants';

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

export { getLabelColor };
