import { CSSProperties } from 'react';

import { useChartData } from '../../context/ChartContext';
import { useScaleChecked } from '../../context/ScaleContext';
import { options } from '../../toolbar/ToolTypes';

const styles: CSSProperties = {
  transformOrigin: 'top left',
  position: 'absolute',
  top: '0px',
  left: '0px',
  width: 1,
  backgroundColor: 'yellow',
};

export function PivotIndicator() {
  const {
    height,
    toolOptions: {
      selectedTool,
      data: { pivot },
    },
  } = useChartData();
  const { scaleX } = useScaleChecked();

  if (options.phaseCorrection.id !== selectedTool) return null;
  const x = Math.round(scaleX()(pivot.value));
  return <Indicator height={height} x={x} />;
}

interface IndicatorProps {
  x: number;
  height: number;
}

function Indicator(props: IndicatorProps) {
  const { x, height } = props;
  return (
    <div
      style={{
        ...styles,
        transform: `translate(${x}px, 0px)`,
        height,
      }}
    />
  );
}