/** @jsxImportSource @emotion/react */

import { memo, useState, useEffect, useCallback } from 'react';

import { buildID } from '../../../data/utilities/Concatenation';
import { useAssignment } from '../../assignment';
import { useChartData } from '../../context/ChartContext';
import { useHighlightData, useHighlight } from '../../highlight';
import { get2DXScale, get2DYScale } from '../utilities/scale';

const Signal = memo(({ signal }) => {
  const { margin, width, height, xDomain, yDomain } = useChartData();
  const scaleX = get2DXScale({ margin, width, xDomain });
  const scaleY = get2DYScale({ margin, height, yDomain });

  const x = scaleX(signal.x.delta);
  const y = scaleY(signal.y.delta);

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
    <g
      className="zone-signal"
      onMouseEnter={() => {
        assignment.onMouseEnter();
        highlight.show();
      }}
      onMouseLeave={() => {
        assignment.onMouseLeave();
        highlight.hide();
      }}
    >
      <circle
        key={signal.id}
        cx={x}
        cy={y}
        r={isHighlighted ? 6 : 3}
        fill={isHighlighted ? 'green' : 'darkgreen'}
      />
    </g>
  );
});

export default Signal;
