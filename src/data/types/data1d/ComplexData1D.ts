import { NmrData1D } from 'cheminfo-types';

export type ComplexData1D = Omit<NmrData1D, 'im'> &
  Required<Pick<NmrData1D, 'im'>>;
