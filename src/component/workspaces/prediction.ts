import { InnerWorkspace } from './Workspace';

export const prediction: InnerWorkspace = {
  version: 1,
  label: 'Prediction workspace',
  display: {
    panels: {
      spectraPanel: { display: true },
      rangesPanel: { display: true },
      zonesPanel: { display: true },
      predictionPanel: { display: true, open: true },
    },
    toolBarButtons: {
      baselineCorrectionTool: true,
      exclusionZonesTool: true,
      exportAs: true,
      FFTTool: true,
      import: true,
      integralTool: true,
      multipleSpectraAnalysisTool: true,
      phaseCorrectionTool: true,
      rangePickingTool: true,
      realImaginary: true,
      slicingTool: true,
      spectraCenterAlignments: true,
      spectraStackAlignments: true,
      apodizationTool: true,
      zeroFillingTool: true,
      zonePickingTool: true,
      zoomOutTool: true,
      zoomTool: true,
    },
  },
};
