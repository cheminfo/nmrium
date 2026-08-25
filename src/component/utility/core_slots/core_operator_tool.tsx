import { ErrorBoundary } from 'react-error-boundary';

import { ToolbarItemError } from '../toolbar_item_error.tsx';

import type { CoreOperatorToolProps } from './core_operator_tool.commons.ts';
import { useToolProps } from './core_operator_tool.commons.ts';

export function CoreOperatorTool(props: CoreOperatorToolProps) {
  const { spectrum, operatorUI } = props;
  const toolProps = useToolProps(props);

  if (!spectrum) return null;
  if (!toolProps) return null;
  if (!operatorUI.Tool) return null;

  const { Tool } = operatorUI;

  return (
    <ErrorBoundary FallbackComponent={ToolbarItemError}>
      <Tool {...toolProps} />
    </ErrorBoundary>
  );
}
