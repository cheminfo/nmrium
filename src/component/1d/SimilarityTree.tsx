import { createTree } from 'ml-tree-similarity';
import { CSSProperties, Fragment } from 'react';

import { isSpectrum1D } from '../../data/data1d/Spectrum1D';
import { useChartData } from '../context/ChartContext';
import { useScaleChecked } from '../context/ScaleContext';
import { useFormatNumberByNucleus } from '../hooks/useFormatNumberByNucleus';
import useSpectrum from '../hooks/useSpectrum';

const circleSize = 3;
const marginTop = circleSize + 10;
const lineColor: CSSProperties['color'] = 'black';
const textColor: CSSProperties['color'] = 'black';
const textPadding = circleSize + 2;
const textSize = 10;
const maxTreeLevels = 25;

export default function SimilarityTree() {
  const {
    height,
    view: {
      spectra: { activeTab, showSimilarityTree },
    },
  } = useChartData();
  const spectrum = useSpectrum();
  const format = useFormatNumberByNucleus(activeTab);
  const { scaleX } = useScaleChecked();
  const scaleY = (value: number) => (height * value) / maxTreeLevels;
  const treeHeadLength = height / maxTreeLevels;

  if (!spectrum || !showSimilarityTree || !isSpectrum1D(spectrum)) return null;

  const {
    data: { x, re },
    display: { color },
  } = spectrum;
  const tree = createTree({ x, y: re });
  const data = mapTreeToArray(tree, 0);

  const paths: string[] = [];
  for (const { level, center, parentCenter, parentLevel } of data) {
    if (parentCenter === undefined) continue;
    const startX = scaleX()(parentCenter);
    const startY = scaleY(parentLevel);
    const midY = startY + treeHeadLength / 2;
    const endX = scaleX()(center);
    const endY = scaleY(level);
    const path = `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L${endX} ${endY}`;
    paths.push(path);
  }

  return (
    <g className="similarity-tree" transform={`translate(0,${marginTop})`}>
      <path
        className="tree-lines"
        d={paths.join(' ')}
        fill="none"
        stroke={lineColor}
      />
      ;
      <g className="tree-nodes">
        {data.map(({ level, center }) => {
          const x = scaleX()(center);
          const y = scaleY(level);
          return (
            <Fragment key={`${level}${center}`}>
              <circle cx={x} cy={y} r={circleSize} fill={color} />
              <text
                x={x + textPadding}
                y={y}
                textAnchor="start"
                alignmentBaseline="middle"
                fill={textColor}
                fontSize={textSize}
              >
                {format(center)}
              </text>
            </Fragment>
          );
        })}
      </g>
    </g>
  );
}

interface TreeItem {
  center: number;
  sum: number;
  level: number;
  parentCenter?: number;
  parentLevel?: number;
}

function mapTreeToArray(
  node: any,
  level: number,
  parentCenter = null,
  parentLevel = -1,
) {
  if (!node) return [];

  const { center, sum } = node;
  const result: TreeItem[] = [{ center, sum, level }];

  for (const obj of result) {
    if (parentCenter) {
      obj.parentCenter = parentCenter;
      obj.parentLevel = parentLevel;
    }
  }

  const left = mapTreeToArray(node.left, level + 1, center, parentLevel + 1);
  const right = mapTreeToArray(node.right, level + 1, center, parentLevel + 1);
  return result.concat(left, right);
}
