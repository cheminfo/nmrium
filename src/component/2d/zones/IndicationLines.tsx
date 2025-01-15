import styled from '@emotion/styled';
import type { Spectrum1D } from 'nmr-load-save';
import { useEffect, useState } from 'react';

import { SIGNAL_INCLUDED_KINDS } from '../../../data/constants/signalsKinds.js';
import { isSpectrum1D } from '../../../data/data1d/Spectrum1D/index.js';
import { useChartData } from '../../context/ChartContext.js';
import { useScale2DX, useScale2DY } from '../utilities/scale.js';

const Line = styled.line`
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
    xDomain,
    yDomain,
    displayerMode,
  } = useChartData();
  const [deltas1D, setDeltas1D] = useState<number[]>([]);

  const scaleX = useScale2DX();
  const scaleY = useScale2DY();

  useEffect(() => {
    const split = activeTab.split(',');

    const nucleus = axis === 'X' ? split[0] : axis === 'Y' ? split[1] : null;
    if (nucleus !== null) {
      const ranges = data
        .filter(
          (_datum) =>
            _datum.display.isVisible && _datum.info.nucleus === nucleus,
        )
        .filter((element): element is Spectrum1D => isSpectrum1D(element))
        .flatMap((_datum) => _datum.ranges.values);

      const deltas = ranges.flatMap((_range) =>
        _range.signals
          .filter((_signal) =>
            SIGNAL_INCLUDED_KINDS.includes(_signal.kind as string),
          )
          .map((_signal) => _signal.delta),
      );
      setDeltas1D(deltas);
    } else {
      setDeltas1D([]);
    }
  }, [activeTab, axis, data, displayerMode]);

  if (!show || !deltas1D?.length) return null;

  return (
    <g>
      {deltas1D.map((_delta, i) => {
        if (axis === 'X') {
          return (
            <Line
              // eslint-disable-next-line react/no-array-index-key
              key={`indicationLine${axis}${i}`}
              x1={scaleX(_delta)}
              x2={scaleX(_delta)}
              y1={scaleY(yDomain[0])}
              y2={scaleY(yDomain[1])}
            />
          );
        } else {
          return (
            <Line
              // eslint-disable-next-line react/no-array-index-key
              key={`indicationLine${axis}${i}`}
              x1={scaleX(xDomain[0])}
              x2={scaleX(xDomain[1])}
              y1={scaleY(_delta)}
              y2={scaleY(_delta)}
            />
          );
        }
      })}
    </g>
  );
}

export default IndicationLines;
