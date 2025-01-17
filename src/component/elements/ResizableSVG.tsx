import React, { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

export interface ResizerSize {
  width: number;
  height: number;
}

interface ConnectorsStyleProps
  extends Pick<
    React.SVGAttributes<SVGCircleElement>,
    'fill' | 'stroke' | 'strokeDasharray'
  > {
  size?: number;
}

type ContainerStyleProps = Pick<
  React.SVGAttributes<SVGRectElement>,
  'fill' | 'stroke' | 'strokeDasharray'
>;

interface ResizableSVGProps {
  children: ReactNode;
  initialSize?: ResizerSize;
  size?: ResizerSize;
  onResize?: (size: ResizerSize) => void;
  minWidth?: number;
  minHeight?: number;
  interactionKind?: 'edge-center' | 'edge';
  connectorStyle?: ConnectorsStyleProps;
  containerStyle?: ContainerStyleProps;
  axis: 'x' | 'y' | 'both';
}

export function ResizableSVG(props: ResizableSVGProps) {
  const {
    children,
    initialSize,
    size,
    minHeight = 0,
    minWidth = 0,
    interactionKind = 'edge',
    connectorStyle,
    containerStyle,
    onResize,
    axis = 'both',
  } = props;
  const { size: connectorSize = 6, ...restConnectorProps } =
    connectorStyle || {};

  const externalWidth = size?.width ?? (initialSize?.width || 0);
  const externalHeight = size?.height ?? (initialSize?.height || 0);
  const innerSizeRef = useRef<ResizerSize>({
    width: externalWidth,
    height: externalHeight,
  });
  const [dimensions, setDimensions] = useState({
    width: externalWidth,
    height: externalHeight,
  });

  const [isResizing, setIsResizing] = useState(false);
  const svgRef = useRef<SVGGElement>(null);
  const enableHorizontalResize = axis === 'both' || axis === 'x';
  const enableVerticalResize = axis === 'both' || axis === 'y';
  const isControl = size?.width !== undefined && size?.height !== undefined;

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const bbox = svgElement.getBBox();
    const currentSize = {
      width: bbox.width,
      height: bbox.height,
    };
    innerSizeRef.current = currentSize;

    if (isControl) {
      return;
    }

    setDimensions(currentSize);
  }, [isControl]);

  function handleMouseDown(
    direction: 'bottom' | 'right' | 'bottom-right',
    event: React.MouseEvent,
  ) {
    event.preventDefault();
    setIsResizing(true);

    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = innerSizeRef.current.width;
    const startHeight = innerSizeRef.current.height;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      const newWidth = startWidth + deltaX;
      const newHeight = startHeight + deltaY;
      const width =
        enableHorizontalResize && direction.includes('right')
          ? Math.max(newWidth, minWidth)
          : startWidth;
      const height =
        enableVerticalResize && direction.includes('bottom')
          ? Math.max(newHeight, minHeight)
          : startHeight;

      const currentSize = { width, height };

      if (width >= minWidth && height >= minHeight) {
        innerSizeRef.current = currentSize;
        onResize?.(currentSize);
      }

      if (size) {
        return;
      }

      setDimensions(currentSize);
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  let width = dimensions.width;
  let height = dimensions.height;

  if (size) {
    width = Math.max(minWidth, size.width);
    height = Math.max(minHeight, size.height);
  }

  return (
    <svg
      style={{
        cursor: isResizing ? 'nwse-resize' : 'default',
        overflow: 'visible',
        position: 'absolute',
      }}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="transparent"
        pointerEvents="none"
        {...containerStyle}
      />
      <g ref={svgRef}>{children}</g>

      {interactionKind === 'edge' && (
        <>
          {enableHorizontalResize && (
            <rect
              x={width - connectorSize / 2}
              width={connectorSize}
              height={height}
              fill="transparent"
              stroke="none"
              style={{ cursor: 'ew-resize' }}
              onMouseDown={(e) => handleMouseDown('right', e)}
            />
          )}

          {enableVerticalResize && (
            <rect
              y={height - connectorSize / 2}
              width={width}
              height={connectorSize}
              fill="transparent"
              stroke="none"
              style={{ cursor: 'ns-resize' }}
              onMouseDown={(e) => handleMouseDown('bottom', e)}
            />
          )}
        </>
      )}
      <circle
        cx={width}
        cy={height}
        r={connectorSize}
        fill={interactionKind === 'edge' ? 'transparent' : 'white'}
        stroke={interactionKind === 'edge' ? 'none' : 'black'}
        onMouseDown={(e) => handleMouseDown('bottom-right', e)}
        style={{ cursor: 'nwse-resize' }}
        {...(interactionKind === 'edge-center' && restConnectorProps)}
      />

      {interactionKind === 'edge-center' && (
        <>
          {enableHorizontalResize && (
            <circle
              cx={width / 2}
              cy={height}
              r={connectorSize}
              fill="white"
              stroke="black"
              onMouseDown={(e) => handleMouseDown('bottom', e)}
              style={{ cursor: 'ns-resize' }}
              {...restConnectorProps}
            />
          )}
          {enableVerticalResize && (
            <circle
              cx={width}
              cy={height / 2}
              r={connectorSize}
              fill="white"
              stroke="black"
              onMouseDown={(e) => handleMouseDown('right', e)}
              style={{ cursor: 'ew-resize' }}
              {...restConnectorProps}
            />
          )}
        </>
      )}
    </svg>
  );
}
