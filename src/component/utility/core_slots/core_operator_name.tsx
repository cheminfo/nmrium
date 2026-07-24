import type { ProcessingOperatorId } from '@zakodium/nmrium-core';
import type { ReactNode } from 'react';

import { useCore } from '../../context/CoreContext.tsx';

interface CoreOperatorNameProps<Id extends ProcessingOperatorId> {
  id: Id;
  fallback?: ReactNode;
}

export function CoreOperatorName<Id extends ProcessingOperatorId>(
  props: CoreOperatorNameProps<Id>,
) {
  const { id, fallback } = props;
  const core = useCore();

  const operator = core.slotOperator(id);
  if (!operator) return fallback;

  return operator.name;
}
