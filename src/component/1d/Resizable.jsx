import { jsx } from '@emotion/core';
/** @jsx jsx */
import { Fragment, useCallback, useState } from 'react';
import Draggable from 'react-draggable';

import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { useScale } from '../context/ScaleContext';

const Resizable = ({ data, dispatchType }) => {
  const { height, margin, mode } = useChartData();
  const [rightDragVisibility, setRightDragVisibility] = useState(false);
  const [leftDragVisibility, setLeftDragVisibility] = useState(false);

  const { from, to } = data;

  const { scaleX } = useScale();
  const dispatch = useDispatch();

  const handleRangeChanged = useCallback(
    (range) => {
      let _data;
      if (range[1] > range[0]) {
        _data = {
          from: range[0],
          to: range[1],
        };
      } else {
        _data = {
          from,
          to,
        };
      }
      dispatch({
        type: dispatchType,
        data: { ...data, ..._data },
      });
    },
    [data, dispatch, dispatchType, from, to],
  );

  const handleRightStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setRightDragVisibility(true);
  }, []);
  const handleRightDrag = useCallback(() => {
    // Empty
  }, []);
  const handleRightStop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      setRightDragVisibility(false);

      const _range =
        mode === 'RTL'
          ? [scaleX().invert(e.layerX), to]
          : [to, scaleX().invert(e.layerX)];

      handleRangeChanged(_range);
    },
    [handleRangeChanged, mode, scaleX, to],
  );

  const handleLeftStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setLeftDragVisibility(true);
  }, []);
  const handleLeftDrag = useCallback(() => {
    // Empty
  }, []);
  const handleLeftStop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      setLeftDragVisibility(false);
      const _range =
        mode === 'RTL'
          ? [from, scaleX().invert(e.layerX)]
          : [scaleX().invert(e.layerX), from];

      handleRangeChanged(_range);
    },
    [from, handleRangeChanged, mode, scaleX],
  );

  return (
    <Fragment>
      <Draggable
        axis="x"
        defaultPosition={{
          x: scaleX()(from),
          y: 0,
        }}
        position={{
          x: scaleX()(from),
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
          style={{ fillOpacity: rightDragVisibility ? 1 : 0 }}
        />
      </Draggable>

      <Draggable
        axis="x"
        defaultPosition={{
          x: scaleX()(to),
          y: 0,
        }}
        position={{
          x: scaleX()(to),
          y: 0,
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
          style={{ fillOpacity: leftDragVisibility ? 1 : 0 }}
        />
      </Draggable>
    </Fragment>
  );
};

export default Resizable;
