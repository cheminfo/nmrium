import { Range } from 'nmr-processing';

import { useActiveSpectrumRangesViewState } from '../../hooks/useActiveSpectrumRangesViewState';

const marginTop = 55;

interface AssignmentLabelProps {
  range: Range;
  x: number;
}
export function AssignmentLabel(props: AssignmentLabelProps) {
  const { range, x } = props;
  const { showAssignmentsLabels } = useActiveSpectrumRangesViewState();

  if (!range.assignment || !showAssignmentsLabels) return null;

  return (
    <text x={x - 5} y={marginTop} fontSize="12px" fill="black" textAnchor="end">
      {range.assignment}
    </text>
  );
}
