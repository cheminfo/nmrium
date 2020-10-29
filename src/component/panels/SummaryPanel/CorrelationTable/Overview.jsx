import lodash from 'lodash';
import React, { memo } from 'react';

import { ErrorColors, Errors } from './Constants';

const Overview = memo(({ atoms, state }) => {
  return Object.keys(atoms).map((atom, i) => {
    const stateAtomType = lodash.get(state, `atomType.${atom}`, false);
    const error = stateAtomType.error;
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
        {`${atom}: ${stateAtomType ? stateAtomType.current : '-'}/${
          atoms[atom]
        }   `}
      </span>
    );
  });
});

export default Overview;
