// error colors in priority order
const ErrorColors = [
  { key: 'outOfLimit', color: 'red' },
  { key: 'ambiguousAttachment', color: 'orange' },
  { key: 'notAttached', color: 'blue' },
  { key: 'incomplete', color: 'red' },
];

const Errors = ErrorColors.map((errorColor) => errorColor.key);

export { Errors, ErrorColors };
