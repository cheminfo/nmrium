import { Workspace } from './Workspace';
import { basic } from './basic';

export const exercise: Workspace = {
  version: 1,
  label: 'Exercise workspace',
  display: {
    general: {
      disableMultipletAnalysis: true,
      hideSetSumFromMolecule: true,
      hideGeneralSettings: true,
      experimentalFeatures: { hidden: true },
    },

    panels: {
      spectraPanel: { display: true, open: true },
      informationPanel: { hidden: true },
      peaksPanel: { hidden: true },
      integralsPanel: { display: true },
      rangesPanel: { hidden: true },
      structuresPanel: { hidden: true },
      filtersPanel: { hidden: true },
      zonesPanel: { hidden: true },
      summaryPanel: { hidden: true },
      multipleSpectraAnalysisPanel: { hidden: true },
      databasePanel: { hidden: true },
      predictionPanel: { hidden: true },
      automaticAssignmentPanel: { hidden: true },
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
      rangePickingTool: false,
      zeroFillingTool: false,
      phaseCorrectionTool: false,
      baseLineCorrectionTool: false,
      FFTTool: false,
      multipleSpectraAnalysisTool: false,
      exclusionZonesTool: false,
    },
  },
  general: basic.general,
  formatting: basic.formatting,
  databases: basic.databases,
};
