import type {
  ProcessingOperatorId,
  ProcessingOperatorUI,
  ProcessingOperatorUIToolProps,
} from '@zakodium/nmrium-core';
import type { PartialPick } from '@zakodium/utils';
import type { FallbackProps } from 'react-error-boundary';
import { ErrorBoundary } from 'react-error-boundary';
import { Toolbar, TooltipHelpContent } from 'react-science/ui';

import { useCore } from '../../context/CoreContext.tsx';

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
  const { spectrum, liveSpectrum, onTriggerOperation, operator } = props;
  const core = useCore();

  if (!spectrum) return null;
  if (!operator.Tool) return null;

  const { Tool } = operator;

  return (
    <ErrorBoundary
      fallbackRender={(props) => (
        <Toolbar.Item
          tooltip={<ErrorOverlay {...props} />}
          icon="error"
          intent="danger"
        />
      )}
    >
      <Tool
        core={core}
        spectrum={spectrum}
        liveSpectrum={liveSpectrum}
        onTriggerOperation={onTriggerOperation}
      />
    </ErrorBoundary>
  );
}

function ErrorOverlay(props: FallbackProps) {
  const error = props.error;
  const message =
    error && typeof error === 'object' && 'message' in error
      ? error.message
      : null;
  const stack =
    error && typeof error === 'object' && 'stack' in error ? error.stack : null;

  return (
    <TooltipHelpContent
      title={message as string}
      description={stack as string}
    />
  );
}
