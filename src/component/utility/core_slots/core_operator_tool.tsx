import type { ProcessingOperatorId } from '@zakodium/nmr-types';
import type {
  ProcessingOperatorUI,
  ProcessingOperatorUIToolProps,
} from '@zakodium/nmrium-core';
import type { PartialPick } from '@zakodium/utils';
import { ErrorBoundary } from 'react-error-boundary';

import { useCore } from '../../context/CoreContext.tsx';
import { ToolbarItemError } from '../toolbar_item_error.tsx';

interface CoreOperatorToolProps {
  operator: ProcessingOperatorUI<ProcessingOperatorId>;
}

export function CoreOperatorTool(
  props: PartialPick<
    Omit<ProcessingOperatorUIToolProps<ProcessingOperatorId>, 'core'>,
    'spectrum'
  > &
    CoreOperatorToolProps,
) {
  const { spectrum, activeOperatorId, onTriggerOperation, operator } = props;
  const core = useCore();

  if (!spectrum) return null;
  if (!operator.Tool) return null;

  const { Tool } = operator;

  return (
    <ErrorBoundary FallbackComponent={ToolbarItemError}>
      <Tool
        core={core}
        spectrum={spectrum}
        activeOperatorId={activeOperatorId}
        onTriggerOperation={onTriggerOperation}
      />
    </ErrorBoundary>
  );
}
