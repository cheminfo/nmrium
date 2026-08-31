import type { ProcessingOperatorId } from '@zakodium/nmr-types';
import type {
  ProcessingOperatorUI,
  ProcessingOperatorUIChartBrushTrackerProps,
} from '@zakodium/nmrium-core';
import { ErrorBoundary } from 'react-error-boundary';

import { LogError } from './core_operator_brush.commons.ts';

interface CoreOperatorChartBrushTrackerProps extends ProcessingOperatorUIChartBrushTrackerProps<ProcessingOperatorId> {
  operatorUI: ProcessingOperatorUI<ProcessingOperatorId>;
}

export function CoreOperatorChartBrushTracker(
  props: CoreOperatorChartBrushTrackerProps,
) {
  const { operatorUI, ...otherProps } = props;

  const { ChartBrushTracker } = operatorUI;
  if (!ChartBrushTracker) return null;

  return (
    <ErrorBoundary FallbackComponent={LogError}>
      <ChartBrushTracker {...otherProps} />
    </ErrorBoundary>
  );
}
