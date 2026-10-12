import type { Zone as ZoneType } from '@zakodium/nmr-types';
import { useEffect, useState } from 'react';
import { LuLink } from 'react-icons/lu';
import { PiTextTBold } from 'react-icons/pi';

import { checkZoneKind } from '../../../data/utilities/ZoneUtilities.js';
import { useAssignment } from '../../assignment/AssignmentsContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { useShareData } from '../../context/ShareDataContext.js';
import type { ActionsButtonsPopoverProps } from '../../elements/ActionsButtonsPopover.js';
import { ActionsButtonsPopover } from '../../elements/ActionsButtonsPopover.js';
import { useHighlight } from '../../highlight/index.js';
import { useActiveSpectrumZonesViewState } from '../../hooks/useActiveSpectrumZonesViewState.js';
import { useExtractAtomAssignmentLabel } from '../../panels/MoleculesPanel/hooks/useExtractAtomAssignmentLabel.js';
import type { Spectrum1DTraces } from '../useTracesSpectra.js';
import { useTracesSpectra } from '../useTracesSpectra.js';
import { getClosestSignal } from '../utilities/extractSpectrumSignals.js';
import { useScale2DX, useScale2DY } from '../utilities/scale.js';

import Signal from './Signal.js';
import { SignalCrosshair } from './SignalCrosshair.js';

interface ZoneProps {
  zoneData: ZoneType;
}

function getAxisAssignment(
  zoneData: ZoneType,
  traces: Spectrum1DTraces,
  signal: ZoneType['signals'][number],
  axis: 'x' | 'y',
) {
  const { from, to } = zoneData[axis];
  const match = getClosestSignal(traces[axis], {
    from,
    to,
    center: signal[axis].delta,
  });
  if (!match?.diaIDs?.length) return;

  return { diaIDs: match.diaIDs, nbAtoms: match.nbAtoms ?? 0 };
}

function Zone(props: ZoneProps) {
  const { zoneData } = props;
  const { x, y, id, signals } = zoneData;

  const dispatch = useDispatch();
  const traces = useTracesSpectra();
  const { get2DSignalAssignmentLabel } = useExtractAtomAssignmentLabel();
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

  const assignments = signals.flatMap((signal) => {
    const x = getAxisAssignment(zoneData, traces, signal, 'x');
    const y = getAxisAssignment(zoneData, traces, signal, 'y');
    if (!x && !y) return [];

    const linkedSignal = {
      ...signal,
      x: x ? { ...signal.x, ...x } : signal.x,
      y: y ? { ...signal.y, ...y } : signal.y,
    };

    return {
      signalId: signal.id,
      ...(x && { x }),
      ...(y && { y }),
      assignment: get2DSignalAssignmentLabel(linkedSignal),
    };
  });

  const actionButtons: ActionsButtonsPopoverProps['buttons'] = [
    {
      icon: <LuLink />,
      onClick: () =>
        dispatch({
          type: 'AUTO_LINK_2D_SIGNALS',
          payload: { zoneId: id, assignments },
        }),
      intent: 'success',
      title: 'Auto link',
      disabled: assignments.length === 0,
    },
    {
      icon: <PiTextTBold />,
      onClick: () => setData({ id: signals[0]?.id }),
      intent: 'success',
      title: 'Add assignment label',
      visible: !signals[0]?.assignment,
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
        space={5}
        closeOnAction
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
        {signals.map((signal) => (
          <Signal key={signal.id} signal={signal} />
        ))}
      </ActionsButtonsPopover>
    </g>
  );
}

export default Zone;
