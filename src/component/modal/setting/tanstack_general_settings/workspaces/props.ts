import type { z } from 'zod';

import type { workspaceValidation } from '../validation.ts';

export interface WorkspacesProps {
  formValues: z.input<typeof workspaceValidation>;
  reset: (values: z.input<typeof workspaceValidation>) => void;
}
