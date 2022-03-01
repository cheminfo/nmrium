export default {
  version: 1,
  label: 'Process 1D Mode',
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
      hideFiltersPanel: false,
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
      hideRealImaginary: false,
      hidePeakTool: false,
      hideIntegralTool: false,
      hideAutoRangesTool: true,
      hideZeroFillingTool: false,
      hidePhaseCorrectionTool: false,
      hideBaseLineCorrectionTool: false,
      hideFFTTool: false,
      hideMultipleSpectraAnalysisTool: true,
      hideExclusionZonesTool: true,
    },
  },
};
