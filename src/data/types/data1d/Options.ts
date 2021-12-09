import { MfOptions } from './MfOptions';

export interface Options {
  isSumConstant: boolean;
  sum: number; //If you force the "sum" the mf should not be exists any more otherwise if mf is exists the "sum" must be null or undefined
  mf?: MfOptions; //mf will be set automatically for the first time based on the first molecules unless the user change it
}
