import type { OptionProps } from '@blueprintjs/core';

export const MODES: Array<OptionProps<string>> = [
  {
    label: 'Basic',
    value: 'basic',
  },
  {
    label: 'Advanced',
    value: 'advance',
  },
];

export type Mode = (typeof MODES)[number]['value'];
