import { GeneralUtilities } from 'nmr-correlation';
import { memo } from 'react';

import { ErrorColors, Errors } from './CorrelationTable/Constants';

function Overview({ correlations }) {
  if (!correlations) {
    return null;
  }

  const atoms = GeneralUtilities.getAtomCounts(correlations);

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
}

export default memo(Overview);
