export interface MultipletDefinition {
  label: string;
  value: string;
  multiplicity: number | null;
}

export const Multiplets: MultipletDefinition[] = [
  { label: 'massive (m)', value: 'm', multiplicity: null },
  { label: 'singlet (s)', value: 's', multiplicity: 1 },
  { label: 'doublet (d)', value: 'd', multiplicity: 2 },
  { label: 'triplet (t)', value: 't', multiplicity: 3 },
  { label: 'quartet (q)', value: 'q', multiplicity: 4 },
  { label: 'quintet (i)', value: 'i', multiplicity: 5 },
  { label: 'sextet (x)', value: 'x', multiplicity: 6 },
  { label: 'septet (p)', value: 'p', multiplicity: 7 },
  { label: 'octet (o)', value: 'o', multiplicity: 8 },
  { label: 'nonet (n)', value: 'n', multiplicity: 9 },
];
