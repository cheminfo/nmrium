import styled from '@emotion/styled';
import { createElement } from 'react';

import { useMouseTracker } from '../../EventsTrackers/MouseTracker.js';
import { useChartData } from '../../context/ChartContext.js';
import { useKeyModifiers } from '../../context/KeyModifierContext.tsx';
import type { IconDataContext, Tool } from '../../toolbar/ToolTypes.ts';
import { getToolIcon } from '../../toolbar/ToolTypes.ts';

const CursorWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  overflow: visible;
  will-change: transform;
  z-index: 99;
`;

export type CursorPlacement =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

interface CursorHeaderProps {
  placement?: CursorPlacement;
  offset?: number;
  size?: number;
}

function getCursorOffset(placement: CursorPlacement, offset: number) {
  const x = placement.includes('left')
    ? -offset
    : placement.includes('right')
      ? offset
      : 0;
  const y = placement.includes('top')
    ? -offset
    : placement.includes('bottom')
      ? offset
      : 0;
  return { x, y };
}

interface ToolIconRendererProps extends IconDataContext {
  toolId: Tool;
  size?: number;
  strokeWidth?: number;
}

function ToolIconRenderer(props: ToolIconRendererProps) {
  const { toolId, size, strokeWidth, ...idc } = props;

  const icon = getToolIcon(toolId, idc);
  if (!icon) return null;
  return createElement(icon, { fontSize: size, strokeWidth });
}
export function CursorToolIcon({
  placement = 'bottom-right',
  offset = 25,
  size = 25,
}: CursorHeaderProps) {
  const {
    width,
    height,
    margin,
    toolOptions: { selectedTool },
  } = useChartData();
  const mousePosition = useMouseTracker();
  const { isPrimary } = useKeyModifiers();
  if (
    !mousePosition ||
    !width ||
    !height ||
    mousePosition.x > width - margin.right ||
    mousePosition.y > height - margin.bottom
  ) {
    return null;
  }

  const { x: offsetX, y: offsetY } = getCursorOffset(placement, offset);

  const x = mousePosition.x + offsetX - size / 2;
  const y = mousePosition.y + offsetY - size / 2;

  return (
    <CursorWrapper
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      <ToolIconRenderer
        toolId={isPrimary ? selectedTool : 'zoom'}
        size={size}
      />
    </CursorWrapper>
  );
}
