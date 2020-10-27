import lodash from 'lodash';
import React, { memo } from 'react';

const Overview = memo(({ atoms, state }) => {
  return Object.keys(atoms).map((atom, i) => {
    const _completenessAtom = lodash.get(state, `atomType.${atom}`, false);
    return (
      <span
        // eslint-disable-next-line react/no-array-index-key
        key={`molFormulaView_${i}`}
        style={{
          color: _completenessAtom
            ? _completenessAtom.complete &&
              !lodash(_completenessAtom, 'error', false)
              ? 'green'
              : 'red'
            : 'black',
        }}
      >
        {`${atom}: ${_completenessAtom ? _completenessAtom.current : '-'}/${
          atoms[atom]
        }   `}
      </span>
    );
  });
});

export default Overview;
