import { Data1D } from './Data1D';

export type ComplexData1D = Omit<Data1D, 'im'> & Required<Pick<Data1D, 'im'>>;
