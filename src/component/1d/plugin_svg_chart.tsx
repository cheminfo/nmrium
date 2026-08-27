import { useMemo } from 'react';

import { useChartData } from '../context/ChartContext.tsx';
import { useCore } from '../context/CoreContext.tsx';
import { useScaleChecked } from '../context/ScaleContext.tsx';
import { useIndicatorLineColor } from '../hooks/useIndicatorLineColor.ts';
import { useStableSpectrum } from '../hooks/useSpectrum.ts';
import { useVerticalAlign } from '../hooks/useVerticalAlign.ts';
import { useLiveOperation } from '../panels/filtersPanel/processings/use_live_operation.ts';
import { CoreOperatorChartSVG } from '../utility/core_slots/core_operator_chart_svg.tsx';

import { getYScale } from './utilities/scale.ts';

export function PluginSVGChart() {
  const core = useCore();
  const spectrum = useStableSpectrum();
  const { height, width, margin } = useChartData();
  const [liveOperation] = useLiveOperation();
  const { scaleX: scaleXBuilder } = useScaleChecked();
  const indicatorLineColor = useIndicatorLineColor();

  const scaleX = useMemo(() => scaleXBuilder(), [scaleXBuilder]);
  const scaleY = useWindowYScale();

  if (!liveOperation) return null;
  if (!spectrum) return null;

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

function useWindowYScale() {
  const { spectraBottomMargin } = useScaleChecked();
  const { height, margin, yDomains } = useChartData();
  const verticalAlign = useVerticalAlign();

  return getYScale({
    height,
    margin,
    verticalAlign,
    yDomain: [0, 1],
    yDomains,
    spectraBottomMargin,
  });
}
