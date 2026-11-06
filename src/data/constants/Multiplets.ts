import { MultiplicityPatterns } from 'nmr-processing';

interface MultipletDefinition {
  label: string;
  value: string;
  multiplicity: number | null;
}

export const multiplets: MultipletDefinition[] = MultiplicityPatterns.map(
  ({ label, value, acs = value, multiplicity }) => ({
    label,
    value: acs,
    multiplicity,
  }),
);
