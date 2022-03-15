import { Workspace } from './Workspace';
import { basic } from './basic';

export const exercise1D: Workspace = {
  version: 1,
  label: 'Exercise 1D Mode',
  display: {
    general: {
      disableMultipletAnalysis: true,
      hideSetSumFromMolecule: true,
      hideGeneralSettings: true,
    },

    panels: {
      spectraPanel: true,
      informationPanel: 'hide',
      peaksPanel: 'hide',
      integralsPanel: true,
      rangesPanel: 'hide',
      structuresPanel: 'hide',
      filtersPanel: 'hide',
      zonesPanel: 'hide',
      summaryPanel: 'hide',
      multipleSpectraAnalysisPanel: 'hide',
      databasePanel: 'hide',
      predictionPanel: true,
    },

    toolBarButtons: {
      zoomTool: true,
      zoomOutTool: true,
      import: false,
      exportAs: false,
      spectraStackAlignments: true,
      spectraCenterAlignments: true,
      realImaginary: false,
      peakTool: true,
      integralTool: true,
      zonePickingTool: false,
      slicingTool: false,
      autoRangesTool: false,
      zeroFillingTool: false,
      phaseCorrectionTool: false,
      baseLineCorrectionTool: false,
      FFTTool: false,
      multipleSpectraAnalysisTool: false,
      exclusionZonesTool: false,
    },
  },
  controllers: basic.controllers,
  formatting: basic.formatting,
};
