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

const Tools = ({ disabled }) => {
  const [mouseCoordinates, setMouseCoordinates] = useState({ x: 0, y: 0 });
  const { width, height } = useDimension();
  const dispatch = useDispatch();
  const state = useChartData();
  const selectedTool = state.selectedTool;
  const mouseMove = useCallback((e) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    const boundingRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - boundingRect.x;
    const y = e.clientY - boundingRect.y;

    requestAnimationFrame(() => {
      setMouseCoordinates({ x, y });
    }, 60);
  }, []);

  const mouseMoveLeave = useCallback(() => {
    setMouseCoordinates(null);
  }, []);

  const mouseClick = () => {
    if (selectedTool === options.peakPicking.id) {
      dispatch({
        type: PEAK_PICKING,
        mouseCoordinates,
      });
    }
  };

  if (disabled) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    >
      <svg
        onMouseMove={mouseMove}
        onMouseLeave={mouseMoveLeave}
        onClick={mouseClick}
        width={width}
        height={height}
      >
        <Fragment>
          {selectedTool === options.zoom.id && (
            <Fragment>
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
      {selectedTool === options.zoom.id && (
        <CrossLinePointer position={mouseCoordinates} />
      )}
    </div>
  );
};

export default Tools;
