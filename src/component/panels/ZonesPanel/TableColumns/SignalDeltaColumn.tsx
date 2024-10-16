import lodashGet from 'lodash/get.js';

import { useDispatch } from '../../../context/DispatchContext.js';
import EditableColumn from '../../../elements/EditableColumn.js';
import { usePanelPreferences } from '../../../hooks/usePanelPreferences.js';
import { formatNumber } from '../../../utility/formatNumber.js';
import { ZoneData } from '../hooks/useMapZones.js';

interface SignalDeltaColumnProps {
  rowData: ZoneData;
  onHoverSignalX: any;
  onHoverSignalY: any;
  nucleus: string;
}

function SignalDeltaColumn({
  rowData,
  onHoverSignalX,
  onHoverSignalY,
  nucleus,
}: SignalDeltaColumnProps) {
  const dispatch = useDispatch();
  const nuclei = nucleus.split(',');
  const { deltaPPM: deltaX } = usePanelPreferences('zones', nuclei[0]);
  const { deltaPPM: deltaY } = usePanelPreferences('zones', nuclei[1]);

  const signalDeltaX = lodashGet(rowData, 'tableMetaInfo.signal.x.delta', null);
  const signalDeltaY = lodashGet(rowData, 'tableMetaInfo.signal.y.delta', null);
  const id = lodashGet(rowData, 'tableMetaInfo.signal.id', undefined);

  function saveXHandler(event) {
    const value = Number(event.target.value);
    dispatch({
      type: 'CHANGE_ZONE_SIGNAL_VALUE',
      payload: {
        zoneId: rowData.id,
        signal: { id, deltaX: value },
      },
    });
  }

  function saveYHandler(event) {
    const value = Number(event.target.value);
    dispatch({
      type: 'CHANGE_ZONE_SIGNAL_VALUE',
      payload: {
        zoneId: rowData.id,
        signal: { id, deltaY: value },
      },
    });
  }

  return (
    <>
      {deltaX.show && (
        <td {...onHoverSignalX}>
          {signalDeltaX !== null ? (
            <EditableColumn
              value={formatNumber(signalDeltaX, deltaX.format)}
              onSave={saveXHandler}
              type="number"
              style={{ padding: '0.1rem 0.4rem' }}
              validate={(val) => val !== ''}
            />
          ) : (
            ''
          )}
        </td>
      )}
      {deltaY.show && (
        <td {...onHoverSignalY}>
          {signalDeltaY !== null ? (
            <EditableColumn
              value={formatNumber(signalDeltaY, deltaY.format)}
              onSave={saveYHandler}
              type="number"
              style={{ padding: '0.1rem 0.4rem' }}
              validate={(val) => val !== ''}
            />
          ) : (
            ''
          )}
        </td>
      )}
    </>
  );
}

export default SignalDeltaColumn;
