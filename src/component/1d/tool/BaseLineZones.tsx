import { BaselineCorrectionZone } from 'nmr-processing';

import { useChartData } from '../../context/ChartContext';
import { useScaleChecked } from '../../context/ScaleContext';
import { useHighlight } from '../../highlight';

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
  const x = scaleX()(to);
  const width = scaleX()(from) - scaleX()(to);

  return (
    <g transform={`translate(${x},0)`} {...onHover}>
      <rect
        x="0"
        width={width}
        height="100%"
        style={{ backgroundColor: 'red' }}
        fill={isActive ? activeFill : '#b8b8b857'}
      />
    </g>
  );
}

export default BaseLineZones;
