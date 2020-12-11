export interface NMRDisplayerProps {
  data?: NMRDisplayerData;
  docsBaseUrl?: string;
  onDataChange?: (data: object) => void;
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
    hideZonesPanel: boolean;
    hideSummaryPanel: boolean;
    hideMultipleSpectraAnalysisPanel: boolean;
  }>;
  toolBarButtons: Partial<{
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
    hideMultipleSpectraAnalysisTool: boolean;
  }>;
}>;

export default function NMRDisplayer(props: NMRDisplayerProps): JSX.Element;
