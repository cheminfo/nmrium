import React from 'react';

import { useChartData } from '../context/ChartContext';
import { options } from '../toolbar/ToolTypes';

const styles = {
  container: {
    transformOrigin: 'top left',
    position: 'absolute',
    top: '0px',
    left: '0px',
    width: 1,
    backgroundColor: 'red',
  },
};

const VerticalIndicator = () => {
  const { height, selectedTool, pivot, scaleX } = useChartData();
  if (options.phaseCorrection.id !== selectedTool) return null;
  return (
    <div
      style={{
        ...styles.container,
        transform: `translate(${scaleX()(pivot)}px, 0px)`,
        height: height,
      }}
    />
  );
};

export default VerticalIndicator;
