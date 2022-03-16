import { Workspace } from './Workspace';
import { basic } from './basic';

export const process1D: Workspace = {
  version: 1,
  label: 'Process 1D workspace',
  display: {
    general: {
      disableMultipletAnalysis: true,
    },

    panels: {
      zonesPanel: true,
      summaryPanel: true,
      multipleSpectraAnalysisPanel: true,
      spectraPanel: 'hide',
      informationPanel: 'hide',
      peaksPanel: 'hide',
      integralsPanel: 'hide',
      rangesPanel: 'hide',
      structuresPanel: 'hide',
      filtersPanel: 'hide',
      databasePanel: 'hide',
      predictionPanel: 'hide',
    },

    toolBarButtons: {
      import: false,
      exportAs: false,
      autoRangesTool: false,
      multipleSpectraAnalysisTool: false,
      exclusionZonesTool: false,
    },
  },
  controllers: basic.controllers,
  formatting: basic.formatting,
};
