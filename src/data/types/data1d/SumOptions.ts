export interface SumOptions {
  isSumConstant: boolean;
  sum: number | undefined; //If you force the "sum" the mf should not be exists any more otherwise if mf is exists the "sum" must be null or undefined
  sumAuto: boolean; // default value is true
  mf?: string; // for example 'C10H20O3', continuously updated if mf is defined, //mf will be set automatically for the first time based on the first molecules unless the user change it
  moleculeId?: string; // key of the selected molecule
}
