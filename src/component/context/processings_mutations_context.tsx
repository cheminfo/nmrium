import { assertDefined } from '@zakodium/utils';
import type { PropsWithChildren } from 'react';
import { createContext, useContext } from 'react';

import type { ProcessingsMutations } from './processings_mutations_context.api.ts';
import { useProcessingsMutationsAPI } from './processings_mutations_context.api.ts';

const ProcessingsMutationsContext = createContext<
  ProcessingsMutations | undefined
>(undefined);

export function ProcessingsMutationsProvider(props: PropsWithChildren) {
  const { children } = props;
  const stableAPI = useProcessingsMutationsAPI();

  return (
    <ProcessingsMutationsContext.Provider value={stableAPI}>
      {children}
    </ProcessingsMutationsContext.Provider>
  );
}

export function useProcessingsMutations(): ProcessingsMutations {
  const api = useContext(ProcessingsMutationsContext);
  assertDefined(api);

  return api;
}
