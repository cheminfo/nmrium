/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState, useEffect, useMemo } from 'react';

import { SignalKindsToInclude } from '../../../data/constants/SignalsKinds';
import { isSpectrum1D } from '../../../data/data1d/Spectrum1D';
import { Datum1D } from '../../../data/types/data1d';
import { useChartData } from '../../context/ChartContext';
import { get2DXScale, get2DYScale } from '../utilities/scale';

const lineStyle = css`
  stroke: lightgrey;
  opacity: 0.7;
`;

interface IndicationLinesProps {
  show: boolean;
  axis: 'X' | 'Y';
}

function IndicationLines({ axis, show }: IndicationLinesProps) {
  const {
    data,
    view: {
      spectra: { activeTab },
    },
    margin,
    width,
    height,
    xDomain,
    yDomain,
    displayerMode,
  } = useChartData();
  const [deltas1D, setDeltas1D] = useState<Array<number>>([]);

  const scaleX = get2DXScale({ margin, width, xDomain });
  const scaleY = get2DYScale({ margin, height, yDomain });

  useEffect(() => {
    const split = activeTab.split(',');

    const nucleus = axis === 'X' ? split[0] : axis === 'Y' ? split[1] : null;
    if (nucleus !== null) {
      const ranges = data
        .filter(
          (_datum) =>
            _datum.display.isVisible && _datum.info.nucleus === nucleus,
        )
        .filter((element): element is Datum1D => isSpectrum1D(element))
        .flatMap((_datum) => _datum.ranges.values);

      const deltas = ranges.flatMap((_range) =>
        _range.signals
          .filter((_signal) =>
            SignalKindsToInclude.includes(_signal.kind as string),
          )
          .map((_signal) => _signal.delta),
      );
      setDeltas1D(deltas);
    } else {
      setDeltas1D([]);
    }
  }, [activeTab, axis, data, displayerMode]);

  const indicationLines = useMemo(() => {
    if (show && deltas1D.length > 0) {
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
}

export default IndicationLines;
