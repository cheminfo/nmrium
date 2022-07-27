import { InnerWorkspace } from './Workspace';

export const basic: InnerWorkspace = {
  version: 2,
  label: 'Default workspace',
  display: {
    panels: {
      spectraPanel: { display: true, open: true },
      informationPanel: { display: true, open: false },
      peaksPanel: { display: true, open: false },
      integralsPanel: { display: true, open: false },
      rangesPanel: { display: true, open: false },
      structuresPanel: { display: true, open: false },
      filtersPanel: { display: true, open: false },
      zonesPanel: { display: true, open: false },
    },
    toolBarButtons: {
      zoomTool: true,
      zoomOutTool: true,
      import: true,
      exportAs: true,
      spectraStackAlignments: true,
      spectraCenterAlignments: true,
      realImaginary: true,
      peakTool: true,
      integralTool: true,
      zonePickingTool: true,
      rangePickingTool: true,
      slicingTool: true,
      apodizationTool: true,
      zeroFillingTool: true,
      FFTTool: true,
      phaseCorrectionTool: true,
      baselineCorrectionTool: true,
    },
  },
};
