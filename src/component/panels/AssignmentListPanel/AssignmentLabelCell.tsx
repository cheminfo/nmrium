interface AssignmentLabelCellProps {
  value: string;
  hydrogenValue: string;
  isExpanded: boolean;
}

export function AssignmentLabelCell(props: AssignmentLabelCellProps) {
  const { value, hydrogenValue, isExpanded } = props;

  if (isExpanded || !hydrogenValue) return value;

  return value ? `${value} (${hydrogenValue})` : `(${hydrogenValue})`;
}
