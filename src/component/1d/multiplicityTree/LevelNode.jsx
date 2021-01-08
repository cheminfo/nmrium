import { useScale } from '../../context/ScaleContext';

import { TREE_LEVEL_COLORS } from './TreeColors';

const LevelNode = ({ signal, signalID, startY, levelHeight }) => {
  const { scaleX } = useScale();
  return (
    <line
      key={`startLevelNode_${signalID}`}
      x1={scaleX()(signal.delta)}
      y1={startY}
      x2={scaleX()(signal.delta)}
      y2={startY + levelHeight}
      stroke={TREE_LEVEL_COLORS[0]}
    />
  );
};

export default LevelNode;
