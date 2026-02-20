import { z } from 'zod';

export const toolBarButtonsValidation = z
  .object({
    zoom: z.boolean().optional(),
    zoomOut: z.boolean().optional(),
    import: z.boolean().optional(),
    exportAs: z.boolean().optional(),
    spectraStackAlignments: z.boolean().optional(),
    spectraCenterAlignments: z.boolean().optional(),
    realImaginary: z.boolean().optional(),
    peakPicking: z.boolean().optional(),
    integral: z.boolean().optional(),
    zonePicking: z.boolean().optional(),
    slicing: z.boolean().optional(),
    rangePicking: z.boolean().optional(),
    zeroFilling: z.boolean().optional(),
    zeroFillingDimension1: z.boolean().optional(),
    zeroFillingDimension2: z.boolean().optional(),
    apodization: z.boolean().optional(),
    apodizationDimension1: z.boolean().optional(),
    apodizationDimension2: z.boolean().optional(),
    phaseCorrection: z.boolean().optional(),
    phaseCorrectionTwoDimensions: z.boolean().optional(),
    baselineCorrection: z.boolean().optional(),
    fft: z.boolean().optional(),
    fftDimension1: z.boolean().optional(),
    fftDimension2: z.boolean().optional(),
    multipleSpectraAnalysis: z.boolean().optional(),
    exclusionZones: z.boolean().optional(),
    autoRangeAndZonePicking: z.boolean().optional(),
    inset: z.boolean().optional(),
  })
  .optional();
