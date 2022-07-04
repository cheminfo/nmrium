import { Workspace } from './Workspace';
import { basic } from './basic';

export const embedded: Workspace = {
  version: 1,
  label: 'Embedded workspace',
  display: {
    general: {
      disableMultipletAnalysis: false,
      hideSetSumFromMolecule: false,
      hideGeneralSettings: false,
      experimentalFeatures: { display: true },
      hidePanelOnLoad: true,
    },

    panels: {
      spectraPanel: { display: true, open: true },
      informationPanel: { display: true, open: false },
      peaksPanel: { display: true, open: false },
      integralsPanel: { display: true, open: false },
      rangesPanel: { display: true, open: false },
      structuresPanel: { display: true, open: false },
      filtersPanel: { display: true, open: false },
      zonesPanel: { display: true, open: false },
      summaryPanel: { display: false, open: false },
      multipleSpectraAnalysisPanel: { display: false, open: false },
      databasePanel: { display: false, open: false },
      predictionPanel: { display: false, open: false },
      automaticAssignmentPanel: { display: false, open: false },
    },
  },
  general: basic.general,
  formatting: basic.formatting,
  databases: basic.databases,
};
