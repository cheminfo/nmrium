import type { Range, Signal1D } from '@zakodium/nmr-types';
import { useRef } from 'react';

import { FieldEdition } from '../../1d-2d/FieldEdition.js';
import { useChartData } from '../../context/ChartContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { useActiveSpectrumRangesViewState } from '../../hooks/useActiveSpectrumRangesViewState.js';
import { useTriggerNewAssignmentLabel } from '../../hooks/useTriggerNewAssignmentLabel.js';

const marginTop = 15;

interface AssignmentLabelProps {
  range: Range;
  signal: Signal1D;
  width: number;
  stackIndex: number;
}

export function AssignmentLabel(props: AssignmentLabelProps) {
  const { range, width, stackIndex, signal } = props;
  const { id } = range;
  const { assignment } = signal;
  const { showAssignmentsLabels } = useActiveSpectrumRangesViewState();
  const dispatch = useDispatch();
  const textRef = useRef<SVGTextElement>(null);
  const { margin } = useChartData();
  const { isNewAssignment, dismissNewLabel } = useTriggerNewAssignmentLabel(id);

  if ((!assignment || !showAssignmentsLabels) && !isNewAssignment) {
    return null;
  }

  function handleChange(value: string) {
    dismissNewLabel();

    dispatch({
      type: 'CHANGE_1D_SIGNAL_ASSIGNMENT_LABEL',
      payload: {
        value,
        rangeId: id,
        signalId: signal.id,
      },
    });
  }
  const baseYOffset = margin?.top + marginTop;
  const yOffset = baseYOffset + stackIndex * 12;
  return (
    <g transform={`translate(${width / 2} ${yOffset})`}>
      <FieldEdition
        onChange={handleChange}
        inputType="text"
        value={assignment || ''}
        PopoverProps={{
          position: 'bottom',
          targetTagName: 'g',
          ...(isNewAssignment
            ? { isOpen: true, onClose: () => dismissNewLabel() }
            : {}),
        }}
      >
        <text
          ref={textRef}
          textAnchor="middle"
          fill="black"
          style={{ cursor: 'hand' }}
          width={width}
          fontSize={12}
        >
          {assignment}
        </text>
      </FieldEdition>
    </g>
  );
}
