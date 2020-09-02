import React from 'react';

import { checkMultiplicity } from '../../extra/utilities/MultiplicityUtilities';

import useFormat from './format';

const SignalColumn = ({ rowData, onHoverSignal, preferences }) => {
  const signal = rowData.tableMetaInfo.signal;
  const format = useFormat(preferences);

  if (!signal) return <td>{''}</td>;

  return (
    <td {...onHoverSignal}>
      {!checkMultiplicity(signal.multiplicity, ['m'])
        ? `${format(rowData.from, 'fromFormat')} - ${format(
            rowData.to,
            'toFormat',
          )}`
        : signal.delta.toFixed(3)}
    </td>
  );
};

export default SignalColumn;
