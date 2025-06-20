import type { Signal2D } from '@zakodium/nmr-types';
import { useCallback, useEffect, useState } from 'react';

import { buildID } from '../../../data/utilities/Concatenation.js';
import { useAssignment } from '../../assignment/AssignmentsContext.js';
import { useHighlight, useHighlightData } from '../../highlight/index.js';
import { useActiveSpectrumZonesViewState } from '../../hooks/useActiveSpectrumZonesViewState.js';
import { useScale2DX, useScale2DY } from '../utilities/scale.js';

import SignalCrosshair from './SignalCrosshair.js';

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
  const isAssignmentActive = assignment.isActive;

  const { showSignals, showPeaks } = useActiveSpectrumZonesViewState();
  const highlight = useHighlight(buildIDs(signal?.id || ''));
  const highlightData = useHighlightData();

  const [isHighlighted, setIsHighlighted] = useState(false);

  useEffect(() => {
    if (
      highlightData.highlight.highlighted.some((_highlighted) =>
        buildIDs(signal.id).includes(_highlighted),
      ) ||
      isAssignmentActive
    ) {
      setIsHighlighted(true);
    } else {
      setIsHighlighted(false);
    }
  }, [
    isAssignmentActive,
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
              assignment?.highlight();
              highlight.show();
            }}
            onMouseLeave={() => {
              assignment?.clearHighlight();
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
