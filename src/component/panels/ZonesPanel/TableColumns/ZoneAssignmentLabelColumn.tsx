import { Button } from 'react-science/ui';

import { useDispatch } from '../../../context/DispatchContext.js';
import {
  CloseEditOnClick,
  EditableColumn,
} from '../../../elements/EditableColumn.js';
import { useExtractAtomAssignmentLabel } from '../../MoleculesPanel/hooks/useExtractAtomAssignmentLabel.js';
import type { ZoneData } from '../hooks/useMapZones.js';

interface ZoneAssignmentLabelColumnProps {
  rowData: ZoneData;
}
function hasDiaIDs(axis?: { diaIDs?: string[] }) {
  return (axis?.diaIDs?.length ?? 0) > 0;
}
export function ZoneAssignmentLabelColumn(
  props: ZoneAssignmentLabelColumnProps,
) {
  const { rowData } = props;
  const dispatch = useDispatch();
  const { get2DSignalAssignmentLabel } = useExtractAtomAssignmentLabel();

  const signal = rowData.signals[0];
  const assignment = signal?.assignment ?? '';
  const isAuto = signal?.isAutoAssignment ?? false;
  const hasLink = hasDiaIDs(signal?.x) || hasDiaIDs(signal?.y);

  function saveHandler(value: string | number) {
    dispatch({
      type: 'CHANGE_ZONE_ASSIGNMENT_LABEL',
      payload: {
        value: String(value),
        zoneID: rowData.id,
        signalID: signal?.id,
      },
    });
  }

  function handleToggleAssignmentMode() {
    if (!signal) return;

    const nextIsAuto = !isAuto;
    let value = assignment;

    if (nextIsAuto) {
      const autoLabel = hasLink
        ? get2DSignalAssignmentLabel(signal)
        : undefined;
      if (!autoLabel) return;
      value = autoLabel;
    }

    dispatch({
      type: 'CHANGE_ZONE_ASSIGNMENT_LABEL',
      payload: {
        value,
        zoneID: rowData.id,
        signalID: signal.id,
        isAutoAssignment: nextIsAuto,
      },
    });
  }

  return (
    <td>
      <EditableColumn
        value={assignment}
        onSave={saveHandler}
        style={{ padding: '0.1rem 0.4rem' }}
        type="text"
        clickType={signal ? 'single' : 'none'}
        rightElement={
          <CloseEditOnClick>
            <Button
              variant="minimal"
              icon={signal?.isAutoAssignment ? 'link' : 'unlink'}
              onClick={handleToggleAssignmentMode}
              disabled={!(isAuto || hasLink)}
              tooltipProps={{
                content: signal?.isAutoAssignment
                  ? 'Switch to manual assignment'
                  : 'Switch to automatic assignment',
              }}
            />
          </CloseEditOnClick>
        }
      />
    </td>
  );
}
