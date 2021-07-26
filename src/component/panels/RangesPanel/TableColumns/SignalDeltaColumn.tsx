import { useCallback } from 'react';

import { useDispatch } from '../../../context/DispatchContext';
import EditableColumn from '../../../elements/EditableColumn';
import { CHANGE_RANGE_SIGNAL_VALUE } from '../../../reducer/types/Types';
import { checkMultiplicity } from '../../extra/utilities/MultiplicityUtilities';

import useFormat from './format';

interface SignalDeltaColumnProps {
  rowData: any;
  onHoverSignal: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
  preferences: string;
}

function SignalDeltaColumn({
  rowData,
  onHoverSignal,
  preferences,
}: SignalDeltaColumnProps) {
  const dispatch = useDispatch();
  const signal = rowData.tableMetaInfo.signal;
  const format = useFormat(preferences);

  const saveHandler = useCallback(
    (event) => {
      dispatch({
        type: CHANGE_RANGE_SIGNAL_VALUE,
        payload: {
          value: event.target.value,
          rangeID: rowData.id,
          signalID: signal.id,
        },
      });
    },
    [dispatch, rowData.id, signal.id],
  );

  if (!signal) return <td>{''}</td>;

  return (
    <td {...onHoverSignal}>
      {!checkMultiplicity(signal.multiplicity, ['m']) ? (
        `${format(rowData.from, 'fromFormat')} - ${format(
          rowData.to,
          'toFormat',
        )}`
      ) : (
        <EditableColumn
          value={signal.delta.toFixed(3)}
          onSave={saveHandler}
          type="number"
          style={{ padding: '0.1rem 0.4rem' }}
        />
      )}
    </td>
  );
}

export default SignalDeltaColumn;
