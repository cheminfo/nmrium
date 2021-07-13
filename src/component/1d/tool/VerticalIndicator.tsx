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
  backgroundColor: 'red',
};

function VerticalIndicator() {
  const {
    height,
    toolOptions: {
      selectedTool,
      data: { pivot },
    },
  } = useChartData();
  const { scaleX } = useScaleChecked();

  if (options.phaseCorrection.id !== selectedTool) return null;
  return (
    <div
      style={{
        ...styles,
        transform: `translate(${scaleX()(pivot.value)}px, 0px)`,
        height: height,
      }}
    />
  );
}

export default VerticalIndicator;
