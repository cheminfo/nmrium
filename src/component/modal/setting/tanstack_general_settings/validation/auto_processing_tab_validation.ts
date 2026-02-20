import { z } from 'zod/v4';

const inputValidation = z.object({
  autoProcessing: z.boolean(),
  filters: z
    .record(
      z.string(),
      z
        .array(
          z.object({
            name: z.string(),
            enabled: z.boolean().optional(),
          }),
        )
        .optional(),
    )
    .optional(),
});

const outputFilterElement = z.object({
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
});

const outputValidation = z.object({
  autoProcessing: z.boolean(),
  filters: z.record(z.string(), outputFilterElement).optional(),
});

export const autoProcessingTabValidation = z.codec(
  outputValidation,
  inputValidation,
  {
    decode: (element) => {
      return {
        autoProcessing: element.autoProcessing,
        filters: Object.fromEntries(
          Object.entries(element.filters || {}).map(([nucleus, filterObj]) => [
            nucleus,
            Object.entries(filterObj).map(([name, enabled]) => ({
              name,
              enabled,
            })),
          ]),
        ),
      };
    },
    encode: (element) => {
      return {
        autoProcessing: element.autoProcessing,
        filters: Object.fromEntries(
          Object.entries(element.filters || {}).map(
            ([nucleus, filterArray]) => [
              nucleus,
              Object.fromEntries(
                (filterArray || []).map((f) => [f.name, f.enabled]),
              ),
            ],
          ),
        ) as z.infer<typeof outputValidation>['filters'],
      };
    },
  },
);
