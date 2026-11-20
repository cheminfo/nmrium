import styled from '@emotion/styled';
import type { KeyboardEvent } from 'react';

import { useDispatch } from '../../context/DispatchContext.js';
import { useShareData } from '../../context/ShareDataContext.js';
import { useHighlight } from '../../highlight/index.js';
import { useScale2DX, useScale2DY } from '../utilities/scale.js';
import type { PositionedLinkedSignal } from '../utilities/signalCrossings.js';

import { LinkedSignalAssignmentLabel } from './LinkedSignalAssignmentLabel.js';
import { useClassifyCorrelation } from './useClassifyCorrelation.js';

const Wrapper = styled.g<{ color: string }>`
  &:hover > circle:first-of-type {
    fill: ${(props) => props.color};
    stroke-width: 5;
  }
`;

interface LinkedSignalProps {
  signal: PositionedLinkedSignal;
}
export function LinkedSignal({ signal }: LinkedSignalProps) {
  const scaleX = useScale2DX();
  const scaleY = useScale2DY();
  const dispatch = useDispatch();
  const { data: newLabel, setData } = useShareData<string | null>();
  const diaIDs = [...signal.xDiaIDs, ...signal.yDiaIDs];
  const { onHover } = useHighlight(diaIDs, { type: 'LINKED_SIGNAL' });
  const id = `${signal.xSignalId}:${signal.ySignalId}`;
  const { color } = useClassifyCorrelation(signal.xDiaIDs, signal.yDiaIDs);

  function handleKeyDown(event: KeyboardEvent<SVGGElement>) {
    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      event.stopPropagation();
      dispatch({ type: 'DELETE_2D_SIGNAL_LINK', payload: { id } });
      if (newLabel === id) {
        setData(null);
      }
    }
  }

  return (
    <Wrapper color={color} onKeyDown={handleKeyDown} {...onHover}>
      <circle
        cx={scaleX(signal.xDelta)}
        cy={scaleY(signal.yDelta)}
        r={4}
        fill="transparent"
        stroke={color}
        strokeWidth={2}
        style={{ cursor: 'pointer' }}
        tabIndex={0}
        onMouseEnter={(event) => {
          if (newLabel !== id) event.currentTarget.focus();
        }}
        onMouseLeave={(event) => event.currentTarget.blur()}
        onClick={(event) => {
          event.stopPropagation();
          setData(id);
        }}
      />

      <LinkedSignalAssignmentLabel signal={signal} color={color} />
    </Wrapper>
  );
}
