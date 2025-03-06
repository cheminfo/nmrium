import styled from '@emotion/styled';
import type { Zone as ZoneType } from 'nmr-processing';
import { useEffect, useState } from 'react';
import { PiTextTBold } from 'react-icons/pi';

import { checkZoneKind } from '../../../data/utilities/ZoneUtilities.js';
import { useAssignment } from '../../assignment/AssignmentsContext.js';
import { useShareData } from '../../context/ShareDataContext.js';
import { SVGButton } from '../../elements/SVGButton.js';
import { HighlightEventSource, useHighlight } from '../../highlight/index.js';
import { useActiveSpectrumZonesViewState } from '../../hooks/useActiveSpectrumZonesViewState.js';
import { useScale2DX, useScale2DY } from '../utilities/scale.js';

import Signal from './Signal.js';

const GroupContainer = styled.g`
  .target {
    visibility: hidden;
  }

  &:hover {
    .target {
      visibility: visible;
    }
  }
`;

interface ZoneProps {
  zoneData: ZoneType;
}

const buttonSize = 16;

function Zone({ zoneData }: ZoneProps) {
  const { x, y, id, signals, assignment } = zoneData;
  const { setData } = useShareData<{ id: string }>();
  const assignmentZone = useAssignment(id);
  const { showZones } = useActiveSpectrumZonesViewState();
  const highlightZone = useHighlight([id], {
    type: HighlightEventSource.ZONE,
    extra: { id },
  });
  const scaleX = useScale2DX();
  const scaleY = useScale2DY();

  const { from: x1 = 0, to: x2 = 0 } = x;
  const { from: y1 = 0, to: y2 = 0 } = y;

  const [reduceOpacity, setReduceOpacity] = useState(false);

  useEffect(() => {
    setReduceOpacity(!checkZoneKind(zoneData));
  }, [zoneData]);

  const isActive = highlightZone.isActive || assignmentZone.isActive;
  const zoneWidth = scaleX(x1) - scaleX(x2);
  const zoneHeight = scaleY(y2) - scaleY(y1);

  return (
    <g
      key={id}
      onMouseEnter={() => {
        assignmentZone.highlight();
        highlightZone.show();
      }}
      onMouseLeave={() => {
        assignmentZone.clearHighlight();
        highlightZone.hide();
      }}
    >
      {showZones && (
        <GroupContainer
          transform={`translate(${scaleX(x2)},${scaleY(y1)})`}
          pointer-events="all"
        >
          <g
            data-no-export="true"
            transform={`translate(-${buttonSize} -${buttonSize})`}
            className="target"
          >
            <rect
              width={zoneWidth + buttonSize * 2}
              height={zoneHeight + buttonSize * 2}
              fill="transparent"
            />
            {!assignment && (
              <SVGButton
                renderIcon={(props) => <PiTextTBold {...props} />}
                backgroundColor="green"
                title="Add assignment label"
                style={{ cursor: 'hand' }}
                onClick={() => setData({ id })}
              />
            )}
          </g>
          <rect
            x="0"
            width={zoneWidth}
            height={zoneHeight}
            className="integral-area"
            fill={isActive ? '#ff6f0057' : '#0000000f'}
            stroke={reduceOpacity ? '#343a40' : 'darkgreen'}
            strokeWidth={reduceOpacity ? '0' : '1'}
          />
        </GroupContainer>
      )}
      {signals.map((_signal, i) => (
        <Signal key={String(id + i)} signal={_signal} />
      ))}
    </g>
  );
}

export default Zone;
