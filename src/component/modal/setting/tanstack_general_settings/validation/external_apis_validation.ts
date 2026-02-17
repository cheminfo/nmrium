import { EXTERNAL_API_KEYS } from '@zakodium/nmrium-core';
import { z } from 'zod';

export const externalAPIValidation = z.object({
  key: z.enum(EXTERNAL_API_KEYS.map(({ key }) => key)),
  serverLink: z.url(),
  APIKey: z.string(),
});
export const externalAPIsValidation = z.array(externalAPIValidation);
