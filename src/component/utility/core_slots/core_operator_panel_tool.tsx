import { ErrorBoundary } from 'react-error-boundary';

import { ToolbarItemError } from '../toolbar_item_error.tsx';

import type { CoreOperatorToolProps } from './core_operator_tool.commons.ts';
import { useToolProps } from './core_operator_tool.commons.ts';

export function CoreOperatorPanelTool(props: CoreOperatorToolProps) {
  const { spectrum, operatorUI } = props;
  const toolProps = useToolProps(props);

  if (!spectrum) return null;
  if (!toolProps) return null;
  if (!operatorUI.PanelTool) return null;

  const { PanelTool } = operatorUI;

  return (
    <ErrorBoundary FallbackComponent={ToolbarItemError}>
      <PanelTool {...toolProps} />
    </ErrorBoundary>
  );
}
