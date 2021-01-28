import { useScale } from '../../context/ScaleContext';

function StringNode({ signal, startY, levelHeight, fontSize, showLabels }) {
  const { scaleX } = useScale();
  return (
    <text
      key={`multiplicityString_${signal.id}`}
      textAnchor="middle"
      x={scaleX()(signal.delta)}
      y={startY + levelHeight / 2}
      fontSize={fontSize}
      lengthAdjust="spacing"
      fill="black"
      visibility={showLabels ? 'visible' : 'hidden'}
    >
      {signal.multiplicity}
    </text>
  );
}

export default StringNode;
