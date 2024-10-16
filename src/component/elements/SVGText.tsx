import type { SVGAttributes } from 'react';
import { useLayoutEffect, useRef, useState } from 'react';

interface SVGTextProps extends SVGAttributes<SVGTextElement> {
  rectProps?: SVGAttributes<SVGRectElement>;
  padding?: number;
  borderRadius?: number;
}

type BoxSize = Pick<DOMRect, 'width' | 'height' | 'x' | 'y'>;

const defaultTextBBox: BoxSize = {
  width: 0,
  height: 0,
  x: 0,
  y: 0,
};

export function SVGText(props: SVGTextProps) {
  const textRef = useRef<SVGTextElement>(null);
  const [boxSize, setBoxSize] = useState<BoxSize>(defaultTextBBox);
  const {
    rectProps = {},
    padding = 0,
    borderRadius = 0,
    children,
    ...otherProps
  } = props;
  const { ...otherRectProps } = rectProps;

  useLayoutEffect(() => {
    const boundary = textRef?.current?.getBBox();
    if (boundary) {
      setBoxSize(boundary);
    }
  }, []);
  const { width: textWidth, height: textHeight, x, y } = boxSize;

  const width = textWidth + padding * 2;
  const height = textHeight + padding * 2;
  return (
    <g>
      <rect
        width={width}
        height={height}
        x={x - padding}
        y={y - padding}
        fill="transparent"
        {...(borderRadius && { rx: borderRadius, ry: borderRadius })}
        {...otherRectProps}
      />
      <text ref={textRef} fill="black" textAnchor="middle" {...otherProps}>
        {children}
      </text>
    </g>
  );
}
