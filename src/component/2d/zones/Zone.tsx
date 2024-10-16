/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Zone as ZoneType } from 'nmr-processing';
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

const stylesOnHover = css`
  pointer-events: bounding-box;

  @document url-prefix("") {
    pointer-events: fill;
  }

  user-select: none;

  .delete-button {
    visibility: hidden;
  }
`;

const stylesHighlighted = css`
  pointer-events: bounding-box;

  @document url-prefix("") {
    pointer-events: fill;
  }

  .integral-area {
    fill: #ff6f0057;
  }

  .delete-button {
    visibility: visible;
    cursor: pointer;
  }
`;

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

function Zone({ zoneData }: ZoneProps) {
  const { x, y, id, signals, assignment } = zoneData;
  const { setData } = useShareData<{ id: string }>();
  const assignmentZone = useAssignment(id);
  const { showZones } = useActiveSpectrumZonesViewState();
  const highlightZone = useHighlight([assignmentZone.id], {
    type: HighlightEventSource.ZONE,
    extra: { id: assignmentZone.id },
  });
  const scaleX = useScale2DX();
  const scaleY = useScale2DY();

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
        assignmentZone.show();
        highlightZone.show();
      }}
      onMouseLeave={() => {
        assignmentZone.hide();
        highlightZone.hide();
      }}
    >
      {showZones && (
        <GroupContainer transform={`translate(${scaleX(x2)},${scaleY(y1)})`}>
          <g
            data-no-export="true"
            transform="translate(-16 -16)"
            className="target"
          >
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
            width={scaleX(x1) - scaleX(x2)}
            height={scaleY(y2) - scaleY(y1)}
            className="integral-area"
            fill="#0000000f"
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
