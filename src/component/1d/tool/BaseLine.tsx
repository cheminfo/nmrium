import type { CSSProperties } from 'react';

import { useChartData } from '../../context/ChartContext.js';
import { useScaleChecked } from '../../context/ScaleContext.js';
import { useIndicatorLineColor } from '../../hooks/useIndicatorLineColor.js';
import { options } from '../../toolbar/ToolTypes.js';

const styles: CSSProperties = {
  transformOrigin: 'top left',
  position: 'absolute',
  top: '0px',
  left: '0px',
  height: 1,
};

function BaseLine() {
  const {
    width,
    margin: { left, right },
    toolOptions: { selectedTool },
  } = useChartData();
  const { scaleY } = useScaleChecked();
  const indicatorColor = useIndicatorLineColor();

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
        backgroundColor: indicatorColor,
      }}
    />
  );
}

export default BaseLine;
