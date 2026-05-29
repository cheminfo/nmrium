import { EXTERNAL_API_KEYS } from '@zakodium/nmrium-core';
import { z } from 'zod';

import { withUUID } from './utils.ts';

const externalAPIValidation = z.object({
  key: z.enum(EXTERNAL_API_KEYS.map(({ key }) => key)),
  name: z.string().nonempty(),
  description: z.string(),
  apiUrl: z.url().nonempty(),
  apiKey: z.string(),
});
export const externalAPIWithUUIDValidation = withUUID(externalAPIValidation);
export const externalAPIsValidation = z.array(externalAPIWithUUIDValidation);
