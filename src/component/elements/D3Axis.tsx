import type { Ref, SVGAttributes } from 'react';
import type { UseLinearPrimaryTicksResult } from 'react-d3-utils';
import type { SVGStyledLineUserConfig } from 'react-science/ui';
import { SVGStyledLine, SVGStyledText } from 'react-science/ui';

import { useTicksConfig } from '../hooks/use_ticks_config.ts';
import type { AxisPosition } from '../utility/getAxisLayout.ts';
import { getAxisLayout } from '../utility/getAxisLayout.ts';

interface BaseD3AxisProps {
  tickLength?: number;
  axisPosition: AxisPosition;
}

type PrimaryGridElementProps = SVGStyledLineUserConfig;

type SecondaryGridElementProps = PrimaryGridElementProps & {
  secondaryGridDensity?: number;
};

interface D3AxisProps
  extends
    BaseD3AxisProps,
    Pick<SVGAttributes<SVGGElement>, 'transform' | 'children' | 'className'>,
    UseLinearPrimaryTicksResult {
  gridSize: number;
  primaryGridProps?: PrimaryGridElementProps;
  secondaryGridProps?: SecondaryGridElementProps;
  showGrid?: boolean;
  showPrimaryGrid?: boolean;
  showSecondaryGrid?: boolean;
  ref?: Ref<SVGGElement | null>;
}

interface TicketsProps extends UseLinearPrimaryTicksResult, BaseD3AxisProps {}
interface BaseLineProps
  extends Pick<UseLinearPrimaryTicksResult, 'scale'>, BaseD3AxisProps {}

interface GridProps<T> extends UseLinearPrimaryTicksResult {
  axisPosition: AxisPosition;
  gridSize: number;
  gridProps?: T;
}

function isVerticalAxis(axisPosition: AxisPosition) {
  return ['left', 'right'].includes(axisPosition);
}

function getSecondaryTickPositions(ticks: Array<{ position: number }>) {
  return ticks
    .slice(0, -1)
    .map((tick, index) => (tick.position + ticks[index + 1].position) / 2);
}

function getTickTransform(position: number, isVertical: boolean) {
  return `translate(${isVertical ? `0,${position}` : `${position},0`})`;
}

function BaseLine(props: BaseLineProps) {
  const { axisPosition, scale } = props;
  const axis = useTicksConfig();
  const { primaryTicks } = axis;
  const { tickLength } = getAxisLayout(axis, props);

  const [x1, x2] = scale.range();
  const sign = ['left', 'top'].includes(axisPosition) ? -1 : 1;

  let path = `M${x2},${sign * tickLength} V0 H${x1} V${sign * tickLength}`;

  if (isVerticalAxis(axisPosition)) {
    path = `M${sign * tickLength},${x2} H0 V${x1} H${sign * tickLength}`;
  }

  return (
    <path
      d={path}
      stroke="black"
      fill="none"
      className="domain"
      {...primaryTicks.tickStyle}
    />
  );
}

function Tickets(props: TicketsProps) {
  const { ticks, axisPosition } = props;
  const axis = useTicksConfig();
  const { primaryTicks, secondaryTicks } = axis;
  const { tickText, primaryLine, secondaryLine } = getAxisLayout(axis, props);

  if (!Array.isArray(ticks) || ticks.length === 0) return null;

  const isVertical = isVerticalAxis(axisPosition);
  const secondaryTickPositions =
    secondaryTicks.enabled && ticks.length > 1
      ? getSecondaryTickPositions(ticks)
      : [];

  return (
    <>
      {ticks.map(({ label, position }) => {
        return (
          <g key={`primary-${label}-${position}`} className="tick">
            <line
              data-testid="axis-primary-tick-line"
              transform={getTickTransform(position, isVertical)}
              {...primaryLine}
              stroke="black"
              {...primaryTicks.tickStyle}
            />

            <SVGStyledText
              transform={getTickTransform(position, isVertical)}
              fill="black"
              data-testid="axis-primary-tick-label"
              {...primaryTicks.textStyle}
              {...tickText}
            >
              {label}
            </SVGStyledText>
          </g>
        );
      })}

      {secondaryTickPositions.map((secondaryTickPosition) => (
        <line
          data-testid="axis-secondary-tick-line"
          key={`secondary-${secondaryTickPosition}`}
          transform={getTickTransform(secondaryTickPosition, isVertical)}
          {...secondaryLine}
          stroke="black"
          {...secondaryTicks.tickStyle}
        />
      ))}
    </>
  );
}

function getLinePosition(
  position: number,
  axisPosition: AxisPosition,
  gridSize: number,
) {
  if (['top', 'bottom'].includes(axisPosition)) {
    return {
      x1: position,
      x2: position,
      y1: axisPosition === 'top' ? gridSize : -gridSize,
      y2: 0,
    };
  }

  return {
    x1: axisPosition === 'left' ? gridSize : -gridSize,
    x2: 0,
    y1: position,
    y2: position,
  };
}

function PrimaryGrid(props: GridProps<PrimaryGridElementProps>) {
  const { ticks, axisPosition, gridSize, gridProps = {} } = props;

  return ticks.map(({ position }) => {
    return (
      <SVGStyledLine
        key={position}
        {...getLinePosition(position, axisPosition, gridSize)}
        stroke="black"
        strokeDasharray="dashed"
        strokeOpacity={0.1}
        {...gridProps}
      />
    );
  });
}
function SecondaryGrid(props: GridProps<SecondaryGridElementProps>) {
  const { ticks, axisPosition, scale, gridSize, gridProps = {} } = props;
  const { secondaryGridDensity = 5, ...otherGridProps } = gridProps;
  const secondaryTickets = scale?.ticks(ticks.length * secondaryGridDensity);

  return secondaryTickets?.map((tick) => {
    const position = scale?.(tick);

    if (!position) return null;

    return (
      <SVGStyledLine
        key={position}
        {...getLinePosition(position, axisPosition, gridSize)}
        stroke="black"
        strokeDasharray="dashed"
        strokeOpacity={0.05}
        {...otherGridProps}
      />
    );
  });
}

export function D3Axis(props: D3AxisProps) {
  const {
    ref,
    ticks,
    scale,
    axisPosition,
    gridSize,
    children,
    primaryGridProps,
    secondaryGridProps,
    tickLength,
    showGrid = false,
    showPrimaryGrid = true,
    showSecondaryGrid = true,
    ...otherProps
  } = props;

  const isVertical = isVerticalAxis(axisPosition);
  const axis = useTicksConfig();
  const { fontSize } = getAxisLayout(axis, { axisPosition, tickLength });

  return (
    <g
      ref={ref}
      fontSize={fontSize}
      textAnchor={isVertical ? 'start' : 'middle'}
      {...otherProps}
    >
      <g className="axis">
        <BaseLine
          axisPosition={axisPosition}
          scale={scale}
          tickLength={tickLength}
        />
        <Tickets
          ticks={ticks}
          axisPosition={axisPosition}
          scale={scale}
          tickLength={tickLength}
        />
        {children}
      </g>
      {showGrid && (
        <g className="grid">
          {showPrimaryGrid && (
            <PrimaryGrid
              ticks={ticks}
              axisPosition={axisPosition}
              scale={scale}
              gridSize={gridSize}
              gridProps={primaryGridProps}
            />
          )}
          {showSecondaryGrid && (
            <SecondaryGrid
              ticks={ticks}
              axisPosition={axisPosition}
              scale={scale}
              gridSize={gridSize}
              gridProps={secondaryGridProps}
            />
          )}
        </g>
      )}
    </g>
  );
}
