import { Data1D } from 'nmr-processing';

export type ComplexData1D = Omit<Data1D, 'im'> & Required<Pick<Data1D, 'im'>>;
