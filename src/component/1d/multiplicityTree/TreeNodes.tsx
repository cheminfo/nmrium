/* eslint-disable react/no-unused-prop-types */
import { CSSProperties, useCallback } from 'react';

import { useScale } from '../../context/ScaleContext';

interface NodeData {
  startX: number;
  _startX: number;
  ratio: number;
  multiplicityIndex: number;
  color: string;
}

interface TreeNodesProps {
  showLabels: boolean;
  startY: number;
  signalID: string;
  levelHeight: number;
  nodesData: Array<NodeData>;
  labelOptions: {
    distance: number;
    fontSize: CSSProperties['fontSize'];
  };
}

function TreeNodes({
  nodesData,
  levelHeight,
  startY,
  signalID,
  labelOptions,
  showLabels,
}: TreeNodesProps) {
  const { scaleX } = useScale();
  const buildTreeNodeAndEdge = useCallback(
    ({ startX, _startX, ratio, multiplicityIndex, color }: NodeData) => {
      const edgeLevel = 2 * multiplicityIndex + 2;
      const _startYEdge = startY + edgeLevel * levelHeight;
      const _startYNode = startY + (edgeLevel + 1) * levelHeight;

      return (
        <g key={`treeNode_${signalID}_${startX}_${_startX}_${ratio}`}>
          {/* ratio text */}
          <text
            textAnchor="middle"
            x={scaleX()(_startX) + labelOptions.distance}
            y={_startYNode + 2 * (levelHeight / 3)}
            fontSize={labelOptions.fontSize}
            fill={color}
            visibility={showLabels ? 'visible' : 'hidden'}
          >
            {ratio}
          </text>
          {/* edge line */}
          <line
            x1={scaleX()(startX)}
            y1={_startYEdge}
            x2={scaleX()(_startX)}
            y2={_startYNode}
            stroke={color}
          />
          {/* node line */}
          <line
            x1={scaleX()(_startX)}
            y1={_startYNode}
            x2={scaleX()(_startX)}
            y2={_startYNode + levelHeight}
            stroke={color}
          />
        </g>
      );
    },
    [
      signalID,
      labelOptions.distance,
      labelOptions.fontSize,
      scaleX,
      showLabels,
      startY,
      levelHeight,
    ],
  );

  return <>{nodesData?.map((node) => buildTreeNodeAndEdge(node))}</>;
}

export default TreeNodes;
