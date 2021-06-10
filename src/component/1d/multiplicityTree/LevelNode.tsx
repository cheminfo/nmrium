import { useScale } from '../../context/ScaleContext';

import { SignalNodeProps } from './MultiplicityTree';
import { TREE_LEVEL_COLORS } from './TreeColors';

interface LevelNodeProps {
  signal: SignalNodeProps;
  startY: number;
  levelHeight: number;
}

function LevelNode({ signal, startY, levelHeight }: LevelNodeProps) {
  const { scaleX } = useScale();
  return (
    <line
      key={`startLevelNode_${signal.id}`}
      x1={scaleX()(signal.delta)}
      y1={startY}
      x2={scaleX()(signal.delta)}
      y2={startY + levelHeight}
      stroke={TREE_LEVEL_COLORS[0]}
    />
  );
}

export default LevelNode;
