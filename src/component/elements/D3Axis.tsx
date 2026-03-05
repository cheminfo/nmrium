import type { SVGAttributes } from 'react';
import { forwardRef } from 'react';
import type { Tick, UseLinearPrimaryTicksResult } from 'react-d3-utils';
import type {
  SVGStyledLineProps,
  SVGStyledLineUserConfig,
  SVGStyledTextProps,
} from 'react-science/ui';
import { SVGStyledLine, SVGStyledText } from 'react-science/ui';

import { useTicksConfig } from '../hooks/use_ticks_config.ts';

type AxisPosition = 'top' | 'bottom' | 'left' | 'right';
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
  gridSize?: number;
  primaryGridProps?: PrimaryGridElementProps;
  secondaryGridProps?: SecondaryGridElementProps;
  showGrid?: boolean;
  showPrimaryGrid?: boolean;
  showSecondaryGrid?: boolean;
}

interface TicketsProps extends UseLinearPrimaryTicksResult, BaseD3AxisProps {}
interface BaseLineProps
  extends Pick<UseLinearPrimaryTicksResult, 'scale'>, BaseD3AxisProps {}

interface GridProps<T> extends UseLinearPrimaryTicksResult {
  axisPosition: AxisPosition;
  gridSize?: number;
  gridProps?: T;
}

function isVerticalAxis(axisPosition: AxisPosition) {
  return ['left', 'right'].includes(axisPosition);
}

function BaseLine(props: BaseLineProps) {
  const { axisPosition, tickLength = 6, scale } = props;
  const [x1, x2] = scale.range();
  const sign = ['left', 'top'].includes(axisPosition) ? -1 : 1;

  let path = `M${x2},${sign * tickLength} V0 H${x1} V${sign * tickLength}`;

  if (isVerticalAxis(axisPosition)) {
    path = `M${sign * tickLength},${x2} H0 V${x1} H${sign * tickLength}`;
  }

  return <path d={path} stroke="black" fill="none" className="domain" />;
}

function Tickets(props: TicketsProps) {
  const { ticks, tickLength = 6, axisPosition } = props;
  const config = useTicksConfig();

  if (!Array.isArray(ticks) || ticks.length === 0) return null;

  const isVertical = isVerticalAxis(axisPosition);
  const positionSign =
    axisPosition === 'left' || axisPosition === 'top' ? -1 : 1;

  const positionTextConfig: SVGStyledTextProps = isVertical
    ? {
        x: positionSign * (tickLength + 3),
        dy: '0.32em',
        textAnchor: positionSign === -1 ? 'end' : 'start',
      }
    : {
        y: positionSign * (tickLength + 3),
        dy: positionSign === -1 ? '0em' : '0.71em',
        textAnchor: 'middle',
      };

  const positionPrimaryLineConfig: SVGStyledLineProps = isVertical
    ? { x1: positionSign * tickLength, x2: 0 }
    : { y1: positionSign * tickLength, y2: 0 };

  const secondaryTickLength = tickLength / 2;
  const secondaryTickOffset = getSecondaryTickOffset(ticks, positionSign);
  const positionSecondaryLineConfig: SVGStyledLineProps = isVertical
    ? {
        x1: positionSign * secondaryTickLength,
        x2: 0,
        y1: secondaryTickOffset,
        y2: secondaryTickOffset,
      }
    : {
        y1: positionSign * secondaryTickLength,
        y2: 0,
        x1: secondaryTickOffset,
        x2: secondaryTickOffset,
      };
  const positionSecondaryFirstLineConfig: SVGStyledLineProps = isVertical
    ? {
        x1: positionSign * secondaryTickLength,
        x2: 0,
        y1: -secondaryTickOffset,
        y2: -secondaryTickOffset,
      }
    : {
        y1: positionSign * secondaryTickLength,
        y2: 0,
        x1: -secondaryTickOffset,
        x2: -secondaryTickOffset,
      };

  return ticks.map(({ label, position }, index) => {
    const isFirst = index === 0;

    return (
      <g
        key={label}
        transform={`translate(${isVertical ? `0,${position}` : `${position},0`})`}
        className="tick"
      >
        {config.isSecondaryEnabled && isFirst && (
          <line {...positionSecondaryFirstLineConfig} stroke="black" />
        )}

        <line {...positionPrimaryLineConfig} stroke="black" />

        {config.isSecondaryEnabled && (
          <line {...positionSecondaryLineConfig} stroke="black" />
        )}

        <SVGStyledText
          fill="black"
          {...config.textStyle}
          {...positionTextConfig}
        >
          {label}
        </SVGStyledText>
      </g>
    );
  });
}

function getSecondaryTickOffset(ticks: Array<Tick<number>>, direction: -1 | 1) {
  if (ticks.length < 2) return 0;

  let [first, second] = ticks;
  if (direction === -1) {
    [first, second] = [second, first];
  }

  return (second.position - first.position) / 2;
}

function getLinePosition(position: any, axisPosition: any, gridSize: any) {
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

export const D3Axis = forwardRef<SVGGElement | null, D3AxisProps>(
  (props, ref) => {
    const {
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

    return (
      <g
        ref={ref}
        fontSize="10"
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
  },
);
