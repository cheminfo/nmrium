import type { Zone as ZoneType } from '@zakodium/nmr-types';
import { useEffect, useState } from 'react';
import { PiTextTBold } from 'react-icons/pi';

import { checkZoneKind } from '../../../data/utilities/ZoneUtilities.js';
import { useAssignment } from '../../assignment/AssignmentsContext.js';
import { useShareData } from '../../context/ShareDataContext.js';
import type { ActionsButtonsPopoverProps } from '../../elements/ActionsButtonsPopover.js';
import { ActionsButtonsPopover } from '../../elements/ActionsButtonsPopover.js';
import { useHighlight } from '../../highlight/index.js';
import { useActiveSpectrumZonesViewState } from '../../hooks/useActiveSpectrumZonesViewState.js';
import { useScale2DX, useScale2DY } from '../utilities/scale.js';

import Signal from './Signal.js';
import { SignalCrosshair } from './SignalCrosshair.js';

interface ZoneProps {
  zoneData: ZoneType;
}

function Zone({ zoneData }: ZoneProps) {
  const { x, y, id, signals, assignment } = zoneData;

  const { setData } = useShareData<{ id: string }>();
  const assignmentZone = useAssignment(id);
  const { showZones } = useActiveSpectrumZonesViewState();
  const highlightZone = useHighlight([id], {
    type: 'ZONE',
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

  const actionButtons: ActionsButtonsPopoverProps['buttons'] = [
    {
      icon: <PiTextTBold />,
      onClick: () => setData({ id }),
      intent: 'success',
      title: 'Add assignment label',
      visible: !assignment,
    },
  ];

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
      {signals.map((signal) => (
        <SignalCrosshair key={signal.id} signal={signal} />
      ))}

      <ActionsButtonsPopover
        buttons={actionButtons}
        targetTagName="g"
        {...(assignment && { isOpen: false })}
      >
        {showZones && (
          <g transform={`translate(${scaleX(x2)},${scaleY(y1)})`}>
            <rect
              x="0"
              width={zoneWidth}
              height={zoneHeight}
              className="integral-area"
              fill={isActive ? '#ff6f0057' : '#0000000f'}
              stroke={reduceOpacity ? '#343a40' : 'darkgreen'}
              strokeWidth={reduceOpacity ? '0' : '1'}
            />
          </g>
        )}
        {signals.map((_signal, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Signal key={id + i} signal={_signal} />
        ))}
      </ActionsButtonsPopover>
    </g>
  );
}

export default Zone;
