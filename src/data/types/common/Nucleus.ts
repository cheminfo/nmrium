export type Nuclei =
  | '1H'
  | '2H'
  | '3H'
  | '3He'
  | '7Li'
  | '13C'
  | '14N'
  | '15N'
  | '17O'
  | '19F'
  | '23Na'
  | '27Al'
  | '29Si'
  | '31P'
  | '57Fe'
  | '63Cu'
  | '67Zn'
  | '129Xe'
  // eslint-disable-next-line @typescript-eslint/ban-types
  | (string & {});

// eslint-disable-next-line @typescript-eslint/ban-types
export type Nucleus = Nuclei | `${Nuclei},${Nuclei}` | (string & {});
