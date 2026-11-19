import type { Spectrum2D } from '@zakodium/nmr-types';
import type { MouseEvent } from 'react';

import { useDispatch } from '../../context/DispatchContext.js';
import { useIsPrimaryKeyActivated } from '../../context/KeyModifierContext.js';
import { useShareData } from '../../context/ShareDataContext.js';
import SignalDeltaLine from '../SignalDeltaLine.js';
import { useNearestSignalCrossing } from '../useNearestSignalCrossing.js';
import { useScale2DX, useScale2DY } from '../utilities/scale.js';

export function SignalCrossingIndicator({
  linkedSignals,
}: Pick<Spectrum2D, 'linkedSignals'>) {
  const { nearest } = useNearestSignalCrossing({ linkedSignals });
  const scaleX = useScale2DX();
  const scaleY = useScale2DY();
  const dispatch = useDispatch();
  const { setData } = useShareData<string | null>();
  const isPrimary = useIsPrimaryKeyActivated();

  if (!isPrimary || !nearest || nearest.isLinked) return null;

  const { xSignalId, ySignalId, assignment } = nearest;

  function handleClick(event: MouseEvent<SVGCircleElement>) {
    if (event.button !== 0) return;

    event.stopPropagation();

    dispatch({
      type: 'ADD_2D_SIGNAL_LINK',
      payload: {
        xSignalId,
        ySignalId,
        assignment,
      },
    });

    if (!assignment) {
      setData(`${xSignalId}:${ySignalId}`);
    }
  }

  return (
    <g data-no-export="true" pointerEvents="none">
      <SignalDeltaLine delta={nearest.xDelta} axis="X" show color="#ff0000" />
      <SignalDeltaLine delta={nearest.yDelta} axis="Y" show color="#ff0000" />
      <circle
        cx={scaleX(nearest.xDelta)}
        cy={scaleY(nearest.yDelta)}
        r={10}
        fill="none"
        stroke="#ff0000"
        strokeWidth={2}
        pointerEvents="all"
        data-self-control="true"
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      />
    </g>
  );
}
