import { Signal1D } from '../../../data/types/data1d';
import { useScaleChecked } from '../../context/ScaleContext';

import { TREE_LEVEL_COLORS } from './TreeColors';

interface LevelNodeProps {
  signal: Signal1D;
  startY: number;
  levelHeight: number;
}

function LevelNode({ signal, startY, levelHeight }: LevelNodeProps) {
  const { scaleX } = useScaleChecked();

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
