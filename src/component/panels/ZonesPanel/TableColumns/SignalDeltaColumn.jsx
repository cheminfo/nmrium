import lodash from 'lodash';
import { Fragment } from 'react';

const SignalDeltaColumn = ({ rowData, onHoverSignalX, onHoverSignalY }) => {
  const signalDeltaX = lodash.get(
    rowData,
    'tableMetaInfo.signal.x.delta',
    undefined,
  );
  const signalDeltaY = lodash.get(
    rowData,
    'tableMetaInfo.signal.y.delta',
    undefined,
  );

  return (
    <Fragment>
      <td {...onHoverSignalX}>{signalDeltaX ? signalDeltaX.toFixed(2) : ''}</td>
      <td {...onHoverSignalY}>{signalDeltaY ? signalDeltaY.toFixed(2) : ''}</td>
    </Fragment>
  );
};

export default SignalDeltaColumn;
