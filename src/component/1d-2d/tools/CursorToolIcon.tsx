import styled from '@emotion/styled';
import { createElement } from 'react';
import { TbRulerMeasure } from 'react-icons/tb';
import { match } from 'ts-pattern';

import { useMouseTracker } from '../../EventsTrackers/MouseTracker.js';
import { useChartData } from '../../context/ChartContext.js';
import { useCore } from '../../context/CoreContext.tsx';
import { useKeyModifiers } from '../../context/KeyModifierContext.tsx';
import useCheckExperimentalFeature from '../../hooks/useCheckExperimentalFeature.ts';
import type { IconDataContext, Tool } from '../../toolbar/ToolTypes.ts';
import { getToolIcon } from '../../toolbar/ToolTypes.ts';
import { CoreOperatorChartMouseIcon } from '../../utility/core_slots/core_operator_chart_mouse_icon.tsx';

const CursorWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  overflow: visible;
  will-change: transform;
  z-index: 99;
  opacity: 0.5;
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
}

function ToolIconRenderer(props: ToolIconRendererProps) {
  const { toolId, size, ...idc } = props;

  const icon = getToolIcon(toolId, idc);
  if (!icon) return null;
  return createElement(icon, { fontSize: size });
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
    processingOperators: { selected: selectedProcessingTool },
  } = useChartData();
  const core = useCore();
  const isExperimental = useCheckExperimentalFeature();
  const mousePosition = useMouseTracker();
  const { isPrimary, shiftKey } = useKeyModifiers();
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
  const showRulerIcon = selectedTool === 'zoom' && shiftKey;

  return (
    <CursorWrapper style={{ transform: `translate(${x}px, ${y}px)` }}>
      {match({ showRulerIcon, selectedProcessingTool, isExperimental })
        .when(
          (input) => {
            const { selectedProcessingTool, isExperimental } = input;

            if (!isExperimental) return false;
            if (!selectedProcessingTool) return false;

            const operatorUI = core.slotOperator(selectedProcessingTool);
            if (!operatorUI?.ChartMouseIcon) return false;

            return true;
          },
          ({ selectedProcessingTool }) => (
            <CoreOperatorChartMouseIcon
              core={core}
              selected={selectedProcessingTool}
              size={size}
            />
          ),
        )
        .with({ showRulerIcon: true }, () => <TbRulerMeasure size={size} />)
        .otherwise(() => (
          <ToolIconRenderer
            toolId={isPrimary ? selectedTool : 'zoom'}
            size={size}
          />
        ))}
    </CursorWrapper>
  );
}
