import React, { useCallback, useState } from 'react';
import Draggable from 'react-draggable';
import * as d3 from 'd3';

import { useChartData } from './context/ChartContext';
import { useDispatch } from './context/DispatchContext';
import { RESIZE_INTEGRAL } from './reducer/Actions';

const IntegralResizable = (props) => {
  const { getScale, height, margin, mode } = useChartData();
  const { id, x, y, yDomain, from, to, integralID } = props;
  const [rightDragVisibility, setRightDragVisibility] = useState(false);
  const [leftDragVisibility, setLeftDragVisibility] = useState(false);

  //   const [pixelRange, setPixelRange] = useState(null);

  // const getYScale = useCallback(
  //   (yDomain) => {
  //     return d3.scaleLinear(yDomain, [height - margin.bottom, margin.top]);
  //   },
  //   [height, margin.bottom, margin.top],
  // );
  const xBoundary = d3.extent(x);
  // const yBoundary = d3.extent(y);
  // const yScale = getYScale(yDomain);

  const dispatch = useDispatch();

  //   useEffect(() => {
  //     const start = getScale(id).x(from);
  //     const end = getScale(id).x(to);

  //     setPixelRange({ from: start, to: end });

  //     console.log(to);
  //   }, [from, getScale, id, to]);

  const handleRightStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setRightDragVisibility(true);
  }, []);
  const handleRightDrag = useCallback((e) => {}, []);
  const handleRightStop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      setRightDragVisibility(false);

      const range =
        mode === 'RTL'
          ? [getScale(id).x.invert(e.layerX), to]
          : [to, getScale(id).x.invert(e.layerX)];

      if (range[1] > range[0]) {
        const integral = {
          from: range[0],
          to: range[1],
          id: integralID,
        };
        dispatch({
          type: RESIZE_INTEGRAL,
          integral,
        });
      } else {
        const integral = {
          from,
          to,
          id: integralID,
        };
        dispatch({
          type: RESIZE_INTEGRAL,
          integral,
        });
      }
    },
    [dispatch, from, getScale, id, integralID, mode, to],
  );
  const handleLeftStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setLeftDragVisibility(true);
  }, []);
  const handleLeftDrag = useCallback((e) => {}, []);
  const handleLeftStop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      setLeftDragVisibility(false);
      const range =
        mode === 'RTL'
          ? [from, getScale(id).x.invert(e.layerX)]
          : [getScale(id).x.invert(e.layerX), from];

      if (range[1] > range[0]) {
        const integral = {
          from: range[0],
          to: range[1],
          id: integralID,
        };
        dispatch({
          type: RESIZE_INTEGRAL,
          integral,
        });
      } else {
        const integral = {
          from,
          to,
          id: integralID,
        };

        dispatch({
          type: RESIZE_INTEGRAL,
          integral,
        });
      }
    },
    [dispatch, from, getScale, id, integralID, mode, to],
  );

  return (
    <g fill="red">
      {/* {pixelRange && (
        <rect
          style={{ fillOpacity: 0.2, pointerEvents: 'none' }}
          x={pixelRange.to}
          y={yScale(yBoundary[1])}
          width={pixelRange.from - pixelRange.to}
          fill="lightgray"
          height={yScale(yBoundary[0]) - yScale(yBoundary[1])}
        />
      )} */}
      <Draggable
        axis="x"
        defaultPosition={{
          x: getScale(id).x(xBoundary[0]),
          // y: yScale(yBoundary[1]),
          y: 0,
        }}
        position={{
          x: getScale(id).x(xBoundary[0]),
          // y: yScale(yBoundary[1]),
          y: 0,
        }}
        scale={1}
        onStart={handleRightStart}
        onDrag={handleRightDrag}
        onStop={handleRightStop}
      >
        <rect
          cursor="ew-resize"
          width={rightDragVisibility ? 1 : 6}
          fill="red"
          height={height + margin.top}
          // yScale(yBoundary[0]) - yScale(yBoundary[1])
          style={{ fillOpacity: rightDragVisibility ? 1 : 0 }}
        />
      </Draggable>

      <Draggable
        axis="x"
        defaultPosition={{
          x: getScale(id).x(xBoundary[1]),
          y: 0,
          // y: yScale(yBoundary[1]),
        }}
        position={{
          x: getScale(id).x(xBoundary[1]),
          y: 0,
          // y: yScale(yBoundary[1]),
        }}
        scale={1}
        onStart={handleLeftStart}
        onDrag={handleLeftDrag}
        onStop={handleLeftStop}
      >
        <rect
          cursor="ew-resize"
          width={leftDragVisibility ? 1 : 6}
          fill="red"
          height={height + margin.top}
          // height={yScale(yBoundary[0]) - yScale(yBoundary[1])}
          style={{ fillOpacity: leftDragVisibility ? 1 : 0 }}
        />
      </Draggable>
    </g>
  );
};

export default IntegralResizable;
