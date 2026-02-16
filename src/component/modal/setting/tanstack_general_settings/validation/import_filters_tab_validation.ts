import { z } from 'zod';

export const nmrLoadersGeneralDataSelection = [
  { label: 'FT', value: 'ft' } as const,
  { label: 'FID', value: 'fid' } as const,
  { label: 'Both', value: 'both' } as const,
  { label: 'Prefer FT', value: 'preferFT' } as const,
  { label: 'Prefer FID', value: 'preferFID' } as const,
];
const nmrLoadersGeneralValidation = z.object({
  dataSelection: z
    .enum(nmrLoadersGeneralDataSelection.map(({ value }) => value))
    .optional(),
  keep1D: z.boolean().optional(),
  keep2D: z.boolean().optional(),
  onlyReal: z.boolean().optional(),
});
const nmrLoadersBrukerValidation = z.object({
  processingNumbers: z.string().optional(),
  experimentNumbers: z.string().optional(),
  onlyFirstProcessedData: z.boolean().optional(),
});
export const nmrLoadersValidation = z.object({
  general: nmrLoadersGeneralValidation,
  bruker: nmrLoadersBrukerValidation,
});
