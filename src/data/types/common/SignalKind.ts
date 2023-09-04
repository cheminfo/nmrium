export type SignalKind =
  | 'undefined'
  | 'signal'
  | 'reference'
  | 'impurity'
  | 'standard'
  // eslint-disable-next-line @typescript-eslint/ban-types
  | (string & {});
