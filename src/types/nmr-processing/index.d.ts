declare module 'nmr-processing' {
  declare function fromMolfile(molfile: any, options: ant): Promise<any>;
  declare function signalsToXY(signals: any, options: any): any;
}
