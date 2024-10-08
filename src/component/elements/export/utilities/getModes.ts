import { OptionProps } from '@blueprintjs/core';

export const MODES: Array<OptionProps<string>> = [
  {
    label: 'Basic',
    value: 'basic',
  },
  {
    label: 'Advance',
    value: 'advance',
  },
];

export type Mode = (typeof MODES)[number]['value'];
