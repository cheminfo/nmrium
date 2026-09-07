import { assertDefined } from '@zakodium/utils';
import { useMemo } from 'react';

import { useChartData } from '../context/ChartContext.tsx';
import { useCore } from '../context/CoreContext.tsx';
import type { ScaleLinearNumberFunction } from '../context/ScaleContext.tsx';
import { useScaleChecked } from '../context/ScaleContext.tsx';
import { useIndicatorLineColor } from '../hooks/useIndicatorLineColor.ts';
import useSpectrum from '../hooks/useSpectrum.ts';
import { useVerticalAlign } from '../hooks/useVerticalAlign.ts';
import { useLiveOperation } from '../panels/filtersPanel/processings/use_live_operation.ts';
import { CoreOperatorChartSVG } from '../utility/core_slots/core_operator_chart_svg.tsx';

import { getYScale } from './utilities/scale.ts';

export function PluginSVGChart1D() {
  const core = useCore();
  const spectrum = useSpectrum();
  const { height, width, margin } = useChartData();
  const [liveOperation] = useLiveOperation();
  const { scaleX: scaleXBuilder } = useScaleChecked();
  const indicatorLineColor = useIndicatorLineColor();

  const scaleX = useChartScaleX(scaleXBuilder);
  const scaleY = useChartScaleY();

  if (!liveOperation) return null;
  if (!spectrum) return null;
  assertDefined(scaleX);

  const operatorUI = core.slotOperator(liveOperation.operatorId);
  if (!operatorUI) return null;

  return (
    <CoreOperatorChartSVG
      core={core}
      operatorUI={operatorUI}
      spectrum={spectrum}
      operation={liveOperation}
      height={height}
      width={width}
      margin={margin}
      scaleX={scaleX}
      scaleY={scaleY}
      indicatorLineColor={indicatorLineColor}
    />
  );
}

function useChartScaleX(scaleXBuilder: ScaleLinearNumberFunction) {
  return useMemo(() => scaleXBuilder(), [scaleXBuilder]);
}

function useChartScaleY() {
  const { spectraBottomMargin } = useScaleChecked();
  const { height, margin, yDomain } = useChartData();
  const verticalAlign = useVerticalAlign();

  return useMemo(
    () =>
      getYScale({
        height,
        margin,
        verticalAlign,
        yDomain,
        yDomains: {},
        spectraBottomMargin,
      }),
    [height, margin, spectraBottomMargin, verticalAlign, yDomain],
  );
}
