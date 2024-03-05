/** @jsxImportSource @emotion/react */

import { Signal2D } from 'nmr-processing';
import { useState, useEffect, useCallback } from 'react';

import { buildID } from '../../../data/utilities/Concatenation';
import { useAssignment } from '../../assignment/AssignmentsContext';
import { useHighlightData, useHighlight } from '../../highlight';
import { useActiveSpectrumZonesViewState } from '../../hooks/useActiveSpectrumZonesViewState';
import { useScale2DX, useScale2DY } from '../utilities/scale';

import SignalCrosshair from './SignalCrosshair';

interface SignalProps {
  signal: Signal2D;
}

function Signal({ signal }: SignalProps) {
  const scaleX = useScale2DX();
  const scaleY = useScale2DY();

  const buildIDs = useCallback((id) => {
    return [id].concat(buildID(id, 'X'), buildID(id, 'Y'));
  }, []);

  const assignment = useAssignment(signal?.id || '');
  const { showSignals, showPeaks } = useActiveSpectrumZonesViewState();
  const highlight = useHighlight(buildIDs(assignment?.id));
  const highlightData = useHighlightData();

  const [isHighlighted, setIsHighlighted] = useState(false);

  useEffect(() => {
    if (
      highlightData.highlight.highlighted.some((_highlighted) =>
        buildIDs(signal.id).includes(_highlighted),
      ) ||
      assignment?.isActive
    ) {
      setIsHighlighted(true);
    } else {
      setIsHighlighted(false);
    }
  }, [
    assignment?.isActive,
    buildIDs,
    highlightData.highlight.highlighted,
    signal.id,
  ]);

  if (!signal) return null;

  return (
    <g className="zone-signal">
      {showSignals && (
        <g>
          <SignalCrosshair signal={signal} />
          <circle
            onMouseEnter={() => {
              assignment?.show();
              highlight.show();
            }}
            onMouseLeave={() => {
              assignment?.hide();
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
        {showPeaks &&
          signal?.peaks?.map((peak, i) => (
            <circle
              key={String(signal.id + i)}
              cx={scaleX(peak.x)}
              cy={scaleY(peak.y)}
              r={2}
              fill="black"
            />
          ))}
      </g>
    </g>
  );
}

export default Signal;
