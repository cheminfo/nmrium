import React, { Fragment, useState, useCallback } from 'react';

import { options } from '../toolbar/FunctionToolBar';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { PEAK_PICKING } from '../reducer/Actions';
import { useDimension } from '../context/DimensionsContext';

import CrossLinePointer from './CrossLinePointer';
import PeakNotationTool from './PeakNotationTool';
import IntegralTool from './IntegralTool';
import BrushTool from './BrushTool';

const Tools = () => {
  const [mouseCoordinates, setMouseCoordinates] = useState({ x: 0, y: 0 });
  const { width, height, margin } = useDimension();
  const dispatch = useDispatch();
  const state = useChartData();
  const selectedTool = state.selectedTool;
  const mouseMove = useCallback(
    (e) => {
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      const boundingRect = e.target.getBoundingClientRect();
      const x = e.clientX - boundingRect.x + margin.left;
      const y = e.clientY - boundingRect.y + margin.top;

      requestAnimationFrame(() => {
        setMouseCoordinates({ x, y });
      }, 60);
    },
    [margin.left, margin.top],
  );

  const mouseMoveLeave = useCallback(() => {
    setMouseCoordinates({ x: 0, y: 0 });
  }, []);

  const mouseClick = () => {
    if (selectedTool === options.peakPicking.id) {
      dispatch({
        type: PEAK_PICKING,
        mouseCoordinates,
      });
    }
  };

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
      }}
      onMouseMove={mouseMove}
      onMouseLeave={mouseMoveLeave}
      onClick={mouseClick}
      width={width}
      height={height}
    >
      <Fragment>
        {selectedTool === options.zoom.id && (
          <Fragment>
            <CrossLinePointer position={mouseCoordinates} />
            <BrushTool isActive={true} />
          </Fragment>
        )}

        {selectedTool === options.integral.id && (
          <IntegralTool isActive={true} />
        )}

        {selectedTool === options.peakPicking.id && (
          <PeakNotationTool
            position={mouseCoordinates}
            showCursorLabel={selectedTool === options.peakPicking.id}
          />
        )}
      </Fragment>
    </svg>
  );
};

export default Tools;
