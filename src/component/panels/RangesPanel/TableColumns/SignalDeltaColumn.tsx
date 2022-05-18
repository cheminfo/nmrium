import { useCallback } from 'react';

import { useDispatch } from '../../../context/DispatchContext';
import EditableColumn from '../../../elements/EditableColumn';
import { CHANGE_RANGE_SIGNAL_VALUE } from '../../../reducer/types/Types';
import { formatNumber } from '../../../utility/formatNumber';
import { checkMultiplicity } from '../../extra/utilities/MultiplicityUtilities';

interface SignalDeltaColumnProps {
  rowData: any;
  onHoverSignal: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
  deltaPPMFormat: string;
}

function SignalDeltaColumn({
  rowData,
  onHoverSignal,
  deltaPPMFormat,
}: SignalDeltaColumnProps) {
  const dispatch = useDispatch();
  const signal = rowData.tableMetaInfo.signal;

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
        `${formatNumber(rowData.from, deltaPPMFormat)} - ${formatNumber(
          rowData.to,
          deltaPPMFormat,
        )}`
      ) : (
        <EditableColumn
          value={formatNumber(signal.delta, deltaPPMFormat)}
          onSave={saveHandler}
          type="number"
          style={{ padding: '0.1rem 0.4rem' }}
        />
      )}
    </td>
  );
}

export default SignalDeltaColumn;
