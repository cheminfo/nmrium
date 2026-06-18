import type { OptionProps } from '@blueprintjs/core';

type PossibleMode = 'basic' | 'advance';
export const MODES: Array<OptionProps<PossibleMode>> = [
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
