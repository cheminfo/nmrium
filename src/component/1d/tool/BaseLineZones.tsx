import { BaselineCorrectionZone } from 'nmr-processing';

import { useChartData } from '../../context/ChartContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { useScaleChecked } from '../../context/ScaleContext.js';
import { ResizerWithScale } from '../../elements/ResizerWithScale.js';
import { useHighlight } from '../../highlight/index.js';
import { useResizerStatus } from '../../hooks/useResizerStatus.js';

function BaseLineZones() {
  const {
    toolOptions: {
      selectedTool,
      data: { baselineCorrection },
    },
  } = useChartData();

  const baseLineZones = baselineCorrection.zones;

  if (selectedTool !== 'baselineCorrection' || baseLineZones.length === 0) {
    return null;
  }

  return (
    <g>
      {baselineCorrection.zones.map((zone) => (
        <BaseLineZone key={zone.id} {...zone} />
      ))}
    </g>
  );
}

function BaseLineZone(props: BaselineCorrectionZone) {
  const { from, to, id } = props;
  const {
    onHover,
    isActive,
    defaultActiveStyle: { backgroundColor: activeFill },
  } = useHighlight([id], { type: 'BASELINE_ZONE', extra: { id } });
  const { scaleX } = useScaleChecked();
  const dispatch = useDispatch();

  function handleOnStopResizing(position) {
    dispatch({
      type: 'RESIZE_BASE_LINE_ZONE',
      payload: {
        id,
        from: scaleX().invert(position.x2),
        to: scaleX().invert(position.x1),
      },
    });
  }

  const isResizingActive = useResizerStatus('baselineCorrection');

  return (
    <g {...onHover} className="base-line-zones">
      <ResizerWithScale
        from={from}
        to={to}
        onEnd={handleOnStopResizing}
        disabled={!isResizingActive}
      >
        {({ x1, x2 }, isResizeActive) => {
          return (
            <rect
              width={Math.abs(x2 - x1)}
              height="100%"
              fill={isActive && !isResizeActive ? activeFill : '#b8b8b857'}
            />
          );
        }}
      </ResizerWithScale>
    </g>
  );
}

export default BaseLineZones;
