/** @jsxImportSource @emotion/react */

import { memo, useState, useEffect, useCallback } from 'react';

import { Signal2D } from '../../../data/types/data2d';
import { buildID } from '../../../data/utilities/Concatenation';
import { useAssignment } from '../../assignment';
import { useChartData } from '../../context/ChartContext';
import { useHighlightData, useHighlight } from '../../highlight';
import { get2DXScale, get2DYScale } from '../utilities/scale';

import SignalCrosshair from './SignalCrosshair';

interface SignalProps {
  signal: Signal2D;
  isVisible: {
    signals?: boolean;
    peaks?: boolean;
    zones?: boolean;
  };
}

const Signal = memo(({ signal, isVisible }: SignalProps) => {
  const { margin, width, height, xDomain, yDomain } = useChartData();
  const scaleX = get2DXScale({ margin, width, xDomain });
  const scaleY = get2DYScale({ margin, height, yDomain });

  const buildIDs = useCallback((id) => {
    return [id].concat(buildID(id, 'X'), buildID(id, 'Y'));
  }, []);

  const assignment = useAssignment(signal.id);
  const highlight = useHighlight(buildIDs(assignment.id));
  const highlightData = useHighlightData();

  const [isHighlighted, setIsHighlighted] = useState(false);

  useEffect(() => {
    if (
      highlightData.highlight.highlighted.some((_highlighted) =>
        buildIDs(signal.id).includes(_highlighted),
      ) ||
      assignment.isActive
    ) {
      setIsHighlighted(true);
    } else {
      setIsHighlighted(false);
    }
  }, [
    assignment.isActive,
    buildIDs,
    highlightData.highlight.highlighted,
    signal.id,
  ]);

  if (!signal) return null;

  return (
    <g className="zone-signal">
      {isVisible.signals && (
        <g>
          <SignalCrosshair signal={signal} />

          <circle
            onMouseEnter={() => {
              assignment.onMouseEnter(undefined);
              highlight.show();
            }}
            onMouseLeave={() => {
              assignment.onMouseLeave(undefined);
              highlight.hide();
            }}
            key={signal.id}
            cx={scaleX(signal.x.delta || 0)}
            cy={scaleY(signal.y.delta || 0)}
            r={isHighlighted ? 6 : 4}
            fill={isHighlighted ? 'green' : 'darkgreen'}
          />
        </g>
      )}
      <g className="zone-signal-peak" style={{ pointerEvents: 'none' }}>
        {isVisible.peaks &&
          signal.peaks &&
          signal.peaks.map((peak, i) => (
            <circle
              key={`${signal.id + i}`}
              cx={scaleX(peak.x)}
              cy={scaleY(peak.y)}
              r={2}
              fill="black"
            />
          ))}
      </g>
    </g>
  );
});

export default Signal;
