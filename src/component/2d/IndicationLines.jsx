/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useState, useEffect, useMemo } from 'react';

import { useChartData } from '../context/ChartContext';
import { SignalKindsToInclude } from '../panels/extra/constants/SignalsKinds';
import { DISPLAYER_MODE } from '../reducer/core/Constants';

import { get2DXScale, get2DYScale } from './utilities/scale';

const lineStyle = css`
  stroke: lightgrey;
  opacity: 0.7;
`;

const IndicationLines = ({ axis, show }) => {
  const {
    data,
    activeTab,
    margin,
    width,
    height,
    xDomain,
    yDomain,
    displayerMode,
  } = useChartData();
  const [deltas1D, setDeltas1D] = useState([]);

  const scaleX = get2DXScale({ margin, width, xDomain });
  const scaleY = get2DYScale({ margin, height, yDomain });

  useEffect(() => {
    const split = activeTab.split(',');
    if (displayerMode === DISPLAYER_MODE.DM_2D && split.length === 2) {
      const nucleus = axis === 'X' ? split[0] : axis === 'Y' ? split[1] : null;
      if (nucleus !== null) {
        const ranges = data
          .filter(
            (_datum) =>
              _datum.info.dimension === 1 &&
              _datum.display.isVisible === true &&
              _datum.info.nucleus === nucleus,
          )
          .map((_datum) => _datum.ranges.values)
          .flat();
        const deltas = ranges
          .map((_range) =>
            _range.signal
              .filter((_signal) =>
                SignalKindsToInclude.some((_kind) => _signal.kind === _kind),
              )
              .map((_signal) => _signal.delta),
          )
          .flat();
        setDeltas1D(deltas);
      } else {
        setDeltas1D([]);
      }
    } else {
      setDeltas1D([]);
    }
  }, [activeTab, axis, data, displayerMode]);

  const indicationLines = useMemo(() => {
    if (show === true && deltas1D.length > 0) {
      const lines = deltas1D.map((_delta, i) => {
        return axis === 'X' ? (
          <line
            css={lineStyle}
            // eslint-disable-next-line react/no-array-index-key
            key={`indicationLine${axis}${i}`}
            x1={scaleX(_delta)}
            x2={scaleX(_delta)}
            y1={scaleY(yDomain[0])}
            y2={scaleY(yDomain[1])}
          />
        ) : axis === 'Y' ? (
          <line
            css={lineStyle}
            // eslint-disable-next-line react/no-array-index-key
            key={`indicationLine${axis}${i}`}
            x1={scaleX(xDomain[0])}
            x2={scaleX(xDomain[1])}
            y1={scaleY(_delta)}
            y2={scaleY(_delta)}
          />
        ) : null;
      });
      return lines;
    }
  }, [axis, deltas1D, scaleX, scaleY, show, xDomain, yDomain]);

  return <g>{indicationLines}</g>;
};

export default IndicationLines;
