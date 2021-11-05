// error colors in priority order
const ErrorColors: Array<{ key: string; color: string }> = [
  { key: 'outOfLimit', color: 'red' },
  { key: 'ambiguousAttachment', color: 'orange' },
  { key: 'notAttached', color: 'blue' },
  { key: 'incomplete', color: 'red' },
];

const Errors = ErrorColors.map((errorColor) => errorColor.key);

const Hybridizations: Array<{ key: string; label: string; value: string }> = [
  {
    key: '-',
    label: '',
    value: '',
  },
  {
    key: 'sp',
    label: 'sp',
    value: 'SP',
  },
  {
    key: 'sp2',
    label: 'sp2',
    value: 'SP2',
  },
  {
    key: 'sp3',
    label: 'sp3',
    value: 'SP3',
  },
];

const DefaultTolerance = {
  C: 0.25,
  H: 0.02,
  N: 0.25,
  F: 0.25,
  Si: 0.25,
  P: 0.25,
};

const EditLinkActions = [
  { key: '-', value: '-', label: 'Select Action' },
  { key: 'delete', value: 'delete', label: 'Delete' },
  { key: 'move', value: 'move', label: 'Move' },
  { key: 'unmove', value: 'unmove', label: 'Unmove' },
];

export {
  DefaultTolerance,
  EditLinkActions,
  Errors,
  ErrorColors,
  Hybridizations,
};
