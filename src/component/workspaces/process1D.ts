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
      zonesPanel: { display: true },
      summaryPanel: { display: true },
      multipleSpectraAnalysisPanel: { display: true, open: true },
      spectraPanel: { display: true, open: true },
      informationPanel: { hidden: true },
      peaksPanel: { hidden: true },
      integralsPanel: { hidden: true },
      rangesPanel: { hidden: true },
      structuresPanel: { hidden: true },
      filtersPanel: { hidden: true },
      databasePanel: { hidden: true },
      predictionPanel: { hidden: true },
      automaticAssignmentPanel: { hidden: true },
    },

    toolBarButtons: {
      import: false,
      exportAs: false,
      rangePickingTool: false,
      multipleSpectraAnalysisTool: false,
      exclusionZonesTool: false,
    },
  },
  controllers: basic.controllers,
  formatting: basic.formatting,
  databases: basic.databases,
};
