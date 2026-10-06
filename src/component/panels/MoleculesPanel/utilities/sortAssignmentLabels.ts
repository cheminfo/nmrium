const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});

export function sortAssignmentLabels(labels: string[]) {
  return labels.toSorted(collator.compare);
}
