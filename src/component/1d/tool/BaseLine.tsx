import { CSSProperties } from 'react';

import { useChartData } from '../../context/ChartContext';
import { useScaleChecked } from '../../context/ScaleContext';
import { options } from '../../toolbar/ToolTypes';

const styles: CSSProperties = {
  transformOrigin: 'top left',
  position: 'absolute',
  top: '0px',
  left: '0px',
  height: 1,
  backgroundColor: 'yellow',
};

function BaseLine() {
  const {
    width,
    margin: { left, right },
    toolOptions: { selectedTool },
  } = useChartData();
  const { scaleY } = useScaleChecked();
  const innerWidth = width - left - right;
  if (
    ![options.phaseCorrection.id, options.baselineCorrection.id].includes(
      selectedTool,
    )
  ) {
    return null;
  }
  return (
    <div
      style={{
        ...styles,
        transform: `translate(${left}px, ${scaleY()(0)}px)`,
        width: innerWidth,
      }}
    />
  );
}

export default BaseLine;
