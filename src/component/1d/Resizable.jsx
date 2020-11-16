import { jsx } from '@emotion/react';
/** @jsx jsx */
import { Fragment, useCallback, useState } from 'react';
import Draggable from 'react-draggable';

import { useChartData } from '../context/ChartContext';
import { useScale } from '../context/ScaleContext';

const Resizable = ({ from, to, onDrag, onDrop }) => {
  const { height, margin, mode } = useChartData();
  const [rightDragVisibility, setRightDragVisibility] = useState(false);
  const [leftDragVisibility, setLeftDragVisibility] = useState(false);

  const { scaleX } = useScale();

  const handleRightStart = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setRightDragVisibility(true);

      if (onDrag) {
        onDrag();
      }
    },
    [onDrag],
  );
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

      let resized;
      if (_range[1] > _range[0]) {
        resized = {
          from: _range[0],
          to: _range[1],
        };
      } else {
        resized = {
          from,
          to,
        };
      }

      onDrop(resized);
    },
    [from, mode, onDrop, scaleX, to],
  );

  const handleLeftStart = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setLeftDragVisibility(true);

      if (onDrag) {
        onDrag();
      }
    },
    [onDrag],
  );
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

      let resized;
      if (_range[1] > _range[0]) {
        resized = {
          from: _range[0],
          to: _range[1],
        };
      } else {
        resized = {
          from,
          to,
        };
      }

      onDrop(resized);
    },
    [from, mode, onDrop, scaleX, to],
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
