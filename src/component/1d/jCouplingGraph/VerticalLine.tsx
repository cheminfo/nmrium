interface VerticalLineProps {
  length: number;
  arrowSize?: number;
}

export function VerticalLine(props: VerticalLineProps) {
  const { length, arrowSize = 10 } = props;
  return (
    <svg
      width={arrowSize}
      height={length + arrowSize}
      viewBox={`-${arrowSize / 2} 0 ${arrowSize} ${length + arrowSize}`}
      style={{ transform: `translate(-${arrowSize / 2}px,0px)` }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth={arrowSize}
          markerHeight={arrowSize}
          refX={0}
          refY={arrowSize / 2}
          orient="auto"
        >
          <polygon
            points={`0 0, ${arrowSize} ${arrowSize / 2} ,0 ${arrowSize} `}
          />
        </marker>
      </defs>
      <line
        x1="0"
        y1={length}
        x2="0"
        y2={arrowSize}
        stroke="black"
        strokeWidth="1"
        markerEnd="url(#arrowhead)"
      />
    </svg>
  );
}
