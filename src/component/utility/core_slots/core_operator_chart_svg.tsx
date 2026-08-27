import type { ProcessingOperatorId } from '@zakodium/nmr-types';
import type {
  ProcessingOperatorUI,
  ProcessingOperatorUIChartSVGProps,
} from '@zakodium/nmrium-core';
import { useEffect } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { ErrorBoundary } from 'react-error-boundary';

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

/**
 * SVG context. No friendly error rendering method.
 *
 * @param props
 */
function LogError(props: FallbackProps) {
  const { error } = props;

  useEffect(() => {
    reportError(error);
  }, [error]);

  return null;
}
