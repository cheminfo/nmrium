import { MultiplicityPatterns } from 'nmr-processing';

export interface MultipletDefinition {
  label: string;
  value: string;
  multiplicity: number | null;
}

export const multiplets: MultipletDefinition[] = MultiplicityPatterns.map(
  ({ label, value, acs, multiplicity }) => ({
    label,
    value: acs || value,
    multiplicity,
  }),
);
