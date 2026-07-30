import type { FallbackProps } from 'react-error-boundary';
import { Toolbar, TooltipHelpContent } from 'react-science/ui';

export function ToolbarItemError(props: FallbackProps) {
  return (
    <Toolbar.Item
      tooltip={<ErrorOverlay {...props} />}
      icon="error"
      intent="danger"
    />
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
