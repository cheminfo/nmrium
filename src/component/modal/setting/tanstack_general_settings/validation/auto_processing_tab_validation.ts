import { Filters1D, Filters2D } from 'nmr-processing';
import { z } from 'zod/v4';

const filtersEnumNames = [
  ...Object.values(Filters1D).map((f) => f.name),
  ...Object.values(Filters2D).map((f) => f.name),
];

const outputFiltersValidation = z
  .array(
    z.object({
      name: z.enum(filtersEnumNames),
      enabled: z.boolean().optional(),
    }),
  )
  .optional();

const inputFiltersElement = z
  .object({
    apodization: z.boolean().optional(),
    apodizationDimension1: z.boolean().optional(),
    apodizationDimension2: z.boolean().optional(),
    backwardLinearPrediction: z.boolean().optional(),
    baselineCorrection: z.boolean().optional(),
    baselineCorrectionTwoDimensions: z.boolean().optional(),
    blpDimension1: z.boolean().optional(),
    blpDimension2: z.boolean().optional(),
    digitalFilter: z.boolean().optional(),
    digitalFilter2D: z.boolean().optional(),
    equallySpaced: z.boolean().optional(),
    exclusionZones: z.boolean().optional(),
    fft: z.boolean().optional(),
    fftDimension1: z.boolean().optional(),
    fftDimension2: z.boolean().optional(),
    flpDimension1: z.boolean().optional(),
    flpDimension2: z.boolean().optional(),
    forwardLinearPrediction: z.boolean().optional(),
    nusDimension2: z.boolean().optional(),
    phaseCorrection: z.boolean().optional(),
    phaseCorrectionTwoDimensions: z.boolean().optional(),
    shift2DX: z.boolean().optional(),
    shift2DY: z.boolean().optional(),
    shiftX: z.boolean().optional(),
    signalProcessing: z.boolean().optional(),
    symmetrizeCosyLike: z.boolean().optional(),
    trim: z.boolean().optional(),
    zeroFilling: z.boolean().optional(),
    zeroFillingDimension1: z.boolean().optional(),
    zeroFillingDimension2: z.boolean().optional(),
  })
  .optional();

const filtersCodec = z.codec(inputFiltersElement, outputFiltersValidation, {
  encode: (value) => {
    if (!value) return undefined;

    const entries = value.map((item) => [item.name, item.enabled]);
    return Object.fromEntries(entries);
  },
  decode: (value) => {
    if (!value) return undefined;

    return Object.entries(value).map(([name, enabled]) => ({
      name: name as (typeof filtersEnumNames)[number],
      enabled,
    }));
  },
});

export const autoProcessingTabValidation = z.object({
  autoProcessing: z.boolean(),
  filters: z.record(z.string(), filtersCodec).optional(),
});
