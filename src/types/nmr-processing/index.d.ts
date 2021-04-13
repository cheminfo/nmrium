declare module 'nmr-processing' {
  import type { Molecule } from 'openchemlib/full';

  declare function predictionProton(
    molecule: Molecule,
    options: any,
  ): Promise<any>;
  declare function signalsToXY(signals: any, options: any): any;
  declare function xyAutoRangesPicking(data: any, options: any): any;
}
