/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState, useEffect } from 'react';

import { Zone as ZoneDataProps } from '../../../data/types/data2d';
import { checkZoneKind } from '../../../data/utilities/ZoneUtilities';
import { useAssignment } from '../../assignment';
import { useChartData } from '../../context/ChartContext';
import { HighlightedSource, useHighlight } from '../../highlight';
import { get2DXScale, get2DYScale } from '../utilities/scale';

import Signal from './Signal';

const stylesOnHover = css`
  pointer-events: bounding-box;
  @-moz-document url-prefix() {
    pointer-events: fill;
  }
  user-select: 'none';
  -webkit-user-select: none; /* Chrome all / Safari all */
  -moz-user-select: none; /* Firefox all */

  .delete-button {
    visibility: hidden;
  }
`;

const stylesHighlighted = css`
  pointer-events: bounding-box;

  @-moz-document url-prefix() {
    pointer-events: fill;
  }
  .Integral-area {
    fill: #ff6f0057;
  }
  .delete-button {
    visibility: visible;
    cursor: pointer;
  }
`;

interface ZoneProps {
  zoneData: ZoneDataProps;
  isVisible: {
    zones: boolean;
  };
}

const Zone = ({ zoneData, isVisible }: ZoneProps) => {
  const { x, y, id, signals } = zoneData;
  const assignmentZone = useAssignment(id);
  const highlightZone = useHighlight([assignmentZone.id], {
    type: HighlightedSource.ZONE,
    extra: { id: assignmentZone.id },
  });
  const { margin, width, height, xDomain, yDomain } = useChartData();
  const scaleX = get2DXScale({ margin, width, xDomain });
  const scaleY = get2DYScale({ margin, height, yDomain });

  const { from: x1 = 0, to: x2 = 0 } = x;
  const { from: y1 = 0, to: y2 = 0 } = y;

  const [reduceOpacity, setReduceOpacity] = useState(false);

  useEffect(() => {
    setReduceOpacity(!checkZoneKind(zoneData));
  }, [zoneData]);

  return (
    <g
      css={
        highlightZone.isActive || assignmentZone.isActive
          ? stylesHighlighted
          : stylesOnHover
      }
      key={id}
      onMouseEnter={() => {
        assignmentZone.onMouseEnter(undefined);
        highlightZone.show();
      }}
      onMouseLeave={() => {
        assignmentZone.onMouseLeave(undefined);
        highlightZone.hide();
      }}
    >
      {isVisible.zones && (
        <g transform={`translate(${scaleX(x2)},${scaleY(y1)})`}>
          <rect
            x="0"
            width={scaleX(x1) - scaleX(x2)}
            height={scaleY(y2) - scaleY(y1)}
            className="Integral-area"
            fill="#0000000f"
            stroke={reduceOpacity ? '#343a40' : 'darkgreen'}
            strokeWidth={reduceOpacity ? '0' : '1'}
          />
        </g>
      )}
      {signals.map((_signal, i) => (
        <Signal key={`${id + i}`} signal={_signal} isVisible={isVisible} />
      ))}
    </g>
  );
};

export default Zone;
