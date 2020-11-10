import React, { memo } from 'react';

import { ErrorColors, Errors } from './CorrelationTable/Constants';
import { getAtoms } from './Utilities';

const Overview = memo(({ correlations }) => {
  if (!correlations) {
    return null;
  }

  const atoms = getAtoms(correlations);

  return Object.keys(atoms).map((atomType, i) => {
    const stateAtomType = correlations.state[atomType];

    const error = stateAtomType ? stateAtomType.error : undefined;
    const errorColorIndex = error
      ? Errors.findIndex((_error) => error[_error] !== undefined)
      : 'black';

    return (
      <span
        // eslint-disable-next-line react/no-array-index-key
        key={`molFormulaView_${i}`}
        style={{
          color: stateAtomType
            ? stateAtomType.complete === true && !error
              ? 'green'
              : errorColorIndex >= 0
              ? ErrorColors[errorColorIndex].color
              : 'black'
            : 'black',
        }}
      >
        {`${atomType}: ${stateAtomType ? stateAtomType.current : '-'}/${
          atoms[atomType]
        }   `}
      </span>
    );
  });
});

export default Overview;
