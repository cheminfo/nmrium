/** @jsx jsx */
import { jsx } from '@emotion/core';
import { memo, useState, useEffect } from 'react';

import { useAssignment } from '../../assignment';
import { useChartData } from '../../context/ChartContext';
import { useHighlightData, useHighlight } from '../../highlight';
import { HighlightSignalConcatenation } from '../../panels/extra/constants/ConcatenationStrings';
import { get2DXScale, get2DYScale } from '../utilities/scale';

const Signal = memo(({ signal, signalID }) => {
  const { margin, width, height, xDomain, yDomain } = useChartData();
  const scaleX = get2DXScale({ margin, width, xDomain });
  const scaleY = get2DYScale({ margin, height, yDomain });

  const x = scaleX(signal.x.delta);
  const y = scaleY(signal.y.delta);

  const assignment = useAssignment(signalID);
  const highlight = useHighlight([
    assignment.id,
    `${assignment.id}${HighlightSignalConcatenation}X`,
    `${assignment.id}${HighlightSignalConcatenation}Y`,
  ]);
  const highlightData = useHighlightData();

  const [isHighlighted, setIsHighlighted] = useState(false);

  useEffect(() => {
    if (
      highlightData.highlight.highlighted.some(
        (_highlighted) =>
          _highlighted === signalID ||
          _highlighted === `${signalID}${HighlightSignalConcatenation}X` ||
          _highlighted === `${signalID}${HighlightSignalConcatenation}Y`,
      ) ||
      assignment.isActive
    ) {
      setIsHighlighted(true);
    } else {
      setIsHighlighted(false);
    }
  }, [assignment.isActive, highlightData.highlight.highlighted, signalID]);

  if (!signal) return null;

  return (
    <g
      className="zone-signal"
      {...{
        onMouseEnter: () => {
          assignment.onMouseEnter();
          highlight.show();
        },
        onMouseLeave: () => {
          assignment.onMouseLeave();
          highlight.hide();
        },
      }}
    >
      <circle
        key={signalID}
        cx={x}
        cy={y}
        r={isHighlighted ? 6 : 3}
        fill={isHighlighted ? 'green' : 'darkgreen'}
      />
    </g>
  );
});

export default Signal;
