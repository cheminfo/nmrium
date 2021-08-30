declare module 'nmr-processing' {
  import type { Molecule } from 'openchemlib/full';

  declare function predictProton(
    molecule: Molecule,
    options: any,
  ): Promise<any>;

  declare function predictAll(
    molecule: Molecule,
    options: {
      predictOptions?: {
        C?: {
          webserviceURL?: string;
        };
      };
    },
  ): Promise<any>;

  declare function signalsToXY(
    signals: any,
    options: { from: number; to: number; frequency: number; nbPoints: number },
  ): any;

  type Item2DOption = number | { x: number; y: number };
  declare function signals2DToZ(
    signals: any,
    options: {
      from: Item2DOption;
      to: Item2DOption;
      width: Item2DOption;
      nbPoints: Item2DOption;
    },
  ): any;

  declare function xyAutoRangesPicking(data: any, options: any): any;

  declare function xyAutoPeaksPicking(data: any, options?: any): any;

  declare function xyzAutoPeaksPicking(data: any, options?: any): any;

  declare function rangesToACS(
    ranges: Array<{ from: number; to: number }>,
    options: {
      filter?: boolean;
      nucleus?: number;
      nbDecimalDelta?: number;
      observedFrequency?: number;
      nbDecimalJ?: number;
    },
  ): any;
}
