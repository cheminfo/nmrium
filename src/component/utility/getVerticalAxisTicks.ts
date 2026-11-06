import type { ScaleContinuousNumeric } from 'd3-scale';
import type { UseLinearPrimaryTicksResult } from 'react-d3-utils';

// Selects rounded tick values with enough vertical space for their labels.
export function getVerticalAxisTicks(
  scale: ScaleContinuousNumeric<number, number>,
  fontSize: number,
): UseLinearPrimaryTicksResult {
  const range = scale.range();
  const axisLength = Math.abs(range[0] - range[1]);
  const minSpace = 8;
  const requiredSpacing = fontSize + minSpace;
  const tickNumber = Math.max(
    1,
    Math.min(10, Math.floor(axisLength / requiredSpacing)),
  );
  const values = scale.ticks(tickNumber);

  // D3's count is approximate; keep evenly spaced ticks that actually fit.
  const spacing =
    values.length > 1 ? Math.abs(scale(values[1]) - scale(values[0])) : 0;
  const stride =
    spacing > 0
      ? Math.max(1, Math.ceil(requiredSpacing / spacing))
      : Math.max(1, values.length);

  return {
    scale,
    ticks: values
      .filter((_, index) => index % stride === 0)
      .map((value) => ({
        value,
        label: String(value),
        position: scale(value),
      })),
  };
}
