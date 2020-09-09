export interface NMRDisplayerProps {
  data?: NMRDisplayerData;
  preferences?: NMRDisplayerPreferences;
}

export interface NMRDisplayerData {
  molecules?: Array<{ molfile: string }>;
  spectra: Array<{
    data?: any;
    id?: string;
    display: {
      name?: string;
    };
    source:
      | {
          jcamp: string;
        }
      | {
          jcampURL: string;
        }
      | {
          original: any;
        };
  }>;
}

export type NMRDisplayerPreferences = Partial<{
  general: Partial<{
    disableMultipletAnalysis: boolean;
    hideSetSumFromMolecule: boolean;
  }>;
  panels: Partial<{
    hideSpectraPanel: boolean;
    hideInformationPanel: boolean;
    hidePeaksPanel: boolean;
    hideIntegralsPanel: boolean;
    hideRangesPanel: boolean;
    hideStructuresPanel: boolean;
    hideFiltersPanel: boolean;
  }>;
  toolsBarButtons: Partial<{
    hideZoomTool: boolean;
    hideZoomOutTool: boolean;
    hideImport: boolean;
    hideExportAs: boolean;
    hideSpectraStackAlignments: boolean;
    hideSpectraCenterAlignments: boolean;
    hideRealImaginary: boolean;
    hidePeakTool: boolean;
    hideIntegralTool: boolean;
    hideAutoRangesTool: boolean;
    hideZeroFillingTool: boolean;
    hidePhaseCorrectionTool: boolean;
    hideBaseLineCorrectionTool: boolean;
    hideFFTTool: boolean;
  }>;
}>;

export default function NMRDisplayer(props: NMRDisplayerProps): JSX.Element;

export function initOCL(): void;
