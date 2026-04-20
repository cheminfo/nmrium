import type { Zones1DNucleusPreferences } from '@zakodium/nmrium-core';

import { useDispatch } from '../../../context/DispatchContext.js';
import { EditableColumn } from '../../../elements/EditableColumn.js';
import { usePanelPreferences } from '../../../hooks/usePanelPreferences.js';
import { formatNumber } from '../../../utility/formatNumber.js';
import type { ZoneData } from '../hooks/useMapZones.js';

import { useSignalHighlight } from './SignalAssignmentsColumns.js';

interface SignalDeltaColumnProps {
  rowData: ZoneData;
  nucleus: string;
}

export default function SignalDeltaColumn(props: SignalDeltaColumnProps) {
  const { rowData, nucleus } = props;
  const dispatch = useDispatch();
  const nuclei = nucleus.split(',');
  const { deltaPPM: deltaX } = usePanelPreferences(
    'zones',
    nuclei[0],
  ) as Zones1DNucleusPreferences;
  const { deltaPPM: deltaY } = usePanelPreferences(
    'zones',
    nuclei[1],
  ) as Zones1DNucleusPreferences;
  const { handleOnMouseEnter, handleOnMouseLeave } =
    useSignalHighlight(rowData);

  const signalDeltaX = rowData.tableMetaInfo.signal.x.delta ?? null;
  const signalDeltaY = rowData.tableMetaInfo.signal.y.delta ?? null;
  const id = rowData.tableMetaInfo.signal.id;

  function saveXHandler(value: string | number) {
    dispatch({
      type: 'CHANGE_ZONE_SIGNAL_VALUE',
      payload: {
        zoneId: rowData.id,
        signal: { id, deltaX: Number(value) },
      },
    });
  }

  function saveYHandler(value: string | number) {
    dispatch({
      type: 'CHANGE_ZONE_SIGNAL_VALUE',
      payload: {
        zoneId: rowData.id,
        signal: { id, deltaY: Number(value) },
      },
    });
  }

  return (
    <>
      {deltaX.show && (
        <td
          onMouseEnter={() => handleOnMouseEnter('x')}
          onMouseLeave={() => handleOnMouseLeave('x')}
        >
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
        <td
          onMouseEnter={() => handleOnMouseEnter('y')}
          onMouseLeave={() => handleOnMouseLeave('y')}
        >
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
