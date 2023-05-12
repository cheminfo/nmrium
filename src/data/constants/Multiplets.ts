import { MultiplicityPatterns } from 'nmr-processing';

export interface MultipletDefinition {
  label: string;
  value: string;
  multiplicity: number | null;
}

export const Multiplets: MultipletDefinition[] = MultiplicityPatterns.map(
  ({ label, value, multiplicity }) => ({
    label: `${label} (${value})`,
    value,
    multiplicity,
  }),
);
