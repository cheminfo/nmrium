import { useMemo } from 'react';

import { useChartData } from '../context/ChartContext.tsx';
import { useCore } from '../context/CoreContext.tsx';
import { useScaleChecked } from '../context/ScaleContext.tsx';
import { useProcessingsMutations } from '../context/processings_mutations_context.tsx';
import { useIndicatorLineColor } from '../hooks/useIndicatorLineColor.ts';
import { useStableSpectrum } from '../hooks/useSpectrum.ts';
import { useLiveEdit } from '../panels/filtersPanel/processings/use_live_edit.ts';
import { useLiveOperation } from '../panels/filtersPanel/processings/use_live_operation.ts';
import { useBrushTrackerEvent } from '../utility/core_slots/core_operator_chart_brush.commons.ts';
import { CoreOperatorChartBrushTracker } from '../utility/core_slots/core_operator_chart_brush_tracker.tsx';

export function PluginChartBrushTracker() {
  const core = useCore();
  const spectrum = useStableSpectrum();
  const { height, width, margin } = useChartData();

  const { scaleX: scaleXBuilder, scaleY: scaleYBuilder } = useScaleChecked();
  const indicatorLineColor = useIndicatorLineColor();

  const [liveOperation, setLiveOperation] = useLiveOperation();
  const liveEdit = useLiveEdit(liveOperation?.uid);
  const processingsMutations = useProcessingsMutations();

  const scaleX = useMemo(() => scaleXBuilder(), [scaleXBuilder]);
  const scaleY = useMemo(() => scaleYBuilder(), [scaleYBuilder]);

  if (!liveOperation) return null;
  if (!spectrum) return null;

  const operatorUI = core.slotOperator(liveOperation.operatorId);
  if (!operatorUI) return null;

  const isLiveEditable = operatorUI?.isLiveEditable ?? false;

  return (
    <CoreOperatorChartBrushTracker
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
      useBrushTrackerEvent={useBrushTrackerEvent}
      onChange={(liveOperation) => {
        liveOperation = setLiveOperation(liveOperation);

        if (!isLiveEditable) return;
        if (!liveEdit.value?.checked) return;

        void processingsMutations.applyLiveChange(
          liveOperation,
          liveEdit.value?.shouldProcessNext ?? false,
        );
      }}
    />
  );
}
