interface AssignmentLabelCellProps {
  value: string;
  hydrogenValue: string;
  isExpanded: boolean;
}

export function AssignmentLabelCell(props: AssignmentLabelCellProps) {
  return formatAssignmentLabel(props);
}

export function formatAssignmentLabel(options: AssignmentLabelCellProps) {
  const { value, hydrogenValue, isExpanded } = options;
  if (isExpanded || !hydrogenValue) return value;

  return value ? `${value} (${hydrogenValue})` : `(${hydrogenValue})`;
}
