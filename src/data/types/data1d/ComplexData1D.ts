import { Data1D } from 'nmr-load-save';

export type ComplexData1D = Omit<Data1D, 'im'> & Required<Pick<Data1D, 'im'>>;
