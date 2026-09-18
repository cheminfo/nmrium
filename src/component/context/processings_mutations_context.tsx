import { assertDefined } from '@zakodium/utils';
import type { PropsWithChildren } from 'react';
import { createContext, use } from 'react';

import type { ProcessingsMutations } from './processings_mutations_context.api.ts';
import { useProcessingsMutationsAPI } from './processings_mutations_context.api.ts';

const ProcessingsMutationsContext = createContext<
  ProcessingsMutations | undefined
>(undefined);

export function ProcessingsMutationsProvider(props: PropsWithChildren) {
  const { children } = props;
  const stableAPI = useProcessingsMutationsAPI();

  return (
    <ProcessingsMutationsContext value={stableAPI}>
      {children}
    </ProcessingsMutationsContext>
  );
}

export function useProcessingsMutations(): ProcessingsMutations {
  const api = use(ProcessingsMutationsContext);
  assertDefined(api);

  return api;
}
