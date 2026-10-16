const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});

/**
 * Sort assignment labels into three groups:
 * 1. Labels containing only digits: "1", "2", "10"
 * 2. Labels containing both letters and digits: "c6", "H10"
 * 3. Labels without digits: "OH"
 *
 * Within each group, labels are sorted using a natural, case-insensitive
 * comparison.
 */
export function sortAssignmentLabels(labels: string[]) {
  return labels.toSorted(
    (a, b) => group(a) - group(b) || collator.compare(a, b),
  );
}

function group(label: string) {
  const trimmed = label.trim();
  // Group 0: labels containing only digits, e.g. "2", "10".
  if (/^\d+$/.test(trimmed)) return 0;
  // Group 1: labels containing at least one digit, e.g. "c6", "H10".
  if (/\d/.test(trimmed)) return 1;
  // Group 2: labels without any digits, e.g. "OH"
  return 2;
}
