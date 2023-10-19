export type SignalKind =
  | 'undefined'
  | 'signal'
  | 'reference'
  | 'impurity'
  | 'standard'
  | 'p1'
  | 'p2'
  | 'p3'
  // eslint-disable-next-line @typescript-eslint/ban-types
  | (string & {});
