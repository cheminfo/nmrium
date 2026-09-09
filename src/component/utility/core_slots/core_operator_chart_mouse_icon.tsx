import type { ProcessingOperatorId } from '@zakodium/nmr-types';
import type {
  NMRiumCore,
  ProcessingOperatorUIChartMouseIconProps,
} from '@zakodium/nmrium-core';
import { ErrorBoundary } from 'react-error-boundary';

import { LogError } from './core_operator_brush.commons.ts';

interface CoreOperatorChartMouseIconProps extends ProcessingOperatorUIChartMouseIconProps {
  core: NMRiumCore;
  selected: ProcessingOperatorId | undefined;
}

export function CoreOperatorChartMouseIcon(
  props: CoreOperatorChartMouseIconProps,
) {
  const { core, selected, size } = props;

  if (!selected) return null;

  const operatorUI = core.slotOperator(selected);
  const ChartMouseIcon = operatorUI?.ChartMouseIcon;

  if (!ChartMouseIcon) return null;

  return (
    <ErrorBoundary FallbackComponent={LogError}>
      <ChartMouseIcon size={size} />
    </ErrorBoundary>
  );
}
