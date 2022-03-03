import { Workspace } from './Workspace';

export const exercise1D: Workspace = {
  version: 1,
  label: 'Exercise 1D Mode',
  display: {
    general: {
      disableMultipletAnalysis: true,
      hideSetSumFromMolecule: true,
      hideGeneralSettings: true,
      hideExperimentalFeatures: true,
    },

    panels: {
      hideSpectraPanel: false,
      hideInformationPanel: true,
      hidePeaksPanel: true,
      hideIntegralsPanel: false,
      hideRangesPanel: true,
      hideStructuresPanel: true,
      hideFiltersPanel: true,
      hideZonesPanel: true,
      hideSummaryPanel: true,
      hideMultipleSpectraAnalysisPanel: true,
      hideDatabasePanel: true,
    },

    toolBarButtons: {
      hideZoomTool: false,
      hideZoomOutTool: false,
      hideImport: true,
      hideExportAs: true,
      hideSpectraStackAlignments: false,
      hideSpectraCenterAlignments: false,
      hideRealImaginary: true,
      hidePeakTool: false,
      hideIntegralTool: false,
      hideAutoRangesTool: true,
      hideZeroFillingTool: true,
      hidePhaseCorrectionTool: true,
      hideBaseLineCorrectionTool: true,
      hideFFTTool: true,
      hideMultipleSpectraAnalysisTool: true,
      hideExclusionZonesTool: true,
    },
  },
};
