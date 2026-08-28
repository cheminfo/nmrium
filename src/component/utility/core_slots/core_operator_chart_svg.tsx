import type { ProcessingOperatorId } from '@zakodium/nmr-types';
import type {
  ProcessingOperatorUI,
  ProcessingOperatorUIChartSVGProps,
} from '@zakodium/nmrium-core';
import { ErrorBoundary } from 'react-error-boundary';

import { LogError } from './core_operator_brush.commons.ts';

interface CoreOperatorChartSVGProps extends ProcessingOperatorUIChartSVGProps<ProcessingOperatorId> {
  operatorUI: ProcessingOperatorUI<ProcessingOperatorId>;
}

export function CoreOperatorChartSVG(props: CoreOperatorChartSVGProps) {
  const {
    operatorUI,
    core,
    spectrum,
    operation,
    height,
    width,
    margin,
    indicatorLineColor,
    scaleX,
    scaleY,
  } = props;

  const { ChartSVG } = operatorUI;
  if (!ChartSVG) return null;

  return (
    <ErrorBoundary FallbackComponent={LogError}>
      <ChartSVG
        core={core}
        spectrum={spectrum}
        operation={operation}
        height={height}
        width={width}
        margin={margin}
        scaleX={scaleX}
        scaleY={scaleY}
        indicatorLineColor={indicatorLineColor}
      />
    </ErrorBoundary>
  );
}
