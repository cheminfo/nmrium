export default {
  version: 1,
  label: 'Exercise 1D Mode',
  display: {
    general: {
      disableMultipletAnalysis: true,
      hideSetSumFromMolecule: false,
    },

    panels: {
      hideSpectraPanel: false,
      hideInformationPanel: false,
      hidePeaksPanel: false,
      hideIntegralsPanel: false,
      hideRangesPanel: true,
      hideStructuresPanel: false,
      hideFiltersPanel: true,
      hideZonesPanel: true,
      hideSummaryPanel: true,
      hideMultipleSpectraAnalysisPanel: true,
      hideDatabasePanel: false,
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
