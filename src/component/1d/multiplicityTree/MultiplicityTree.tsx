/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { xFindClosestIndex } from 'ml-spectra-processing';
import { Spectrum1D } from 'nmr-load-save';
import { Range } from 'nmr-processing';

import { isSpectrum1D } from '../../../data/data1d/Spectrum1D';
import {
  AssignmentsData,
  useAssignment,
  useAssignmentData,
} from '../../assignment/AssignmentsContext';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import { useScaleChecked } from '../../context/ScaleContext';
import { HighlightEventSource, useHighlight } from '../../highlight';
import useSpectrum from '../../hooks/useSpectrum';
import { AssignmentActionsButtons } from '../ranges/AssignmentActionsButtons';

import { TreeNodes, generateTreeNodes } from './generateTreeNodes';

const styles = {
  cursor: 'default',
  opacity: 0.6,
  strokeWidth: 1,
};

const cssStyle = css`
  .signal-target {
    visibility: hidden;
  }

  &:hover {
    .signal-target {
      visibility: visible;
    }
  }
`;

interface MultiplicityTreeProps {
  range: Range;
}

const TREE_LEVEL_COLORS: string[] = ['red', 'green', 'blue', 'magenta'];

const marginBottom = 20;
const headTextMargin = 5;
const tailLengthScale = 30;
const boxPadding = 20;
export default function MultiplicityTree(props: MultiplicityTreeProps) {
  const { range } = props;
  const spectrum = useSpectrum();
  const { scaleY } = useScaleChecked();
  if (!spectrum || !isSpectrum1D(spectrum)) return null;
  const { from, to } = range;
  const maxY = getMaxY(spectrum, { from, to });
  const startY = scaleY(spectrum.id)(maxY) - marginBottom;

  const tree = generateTreeNodes(range, spectrum);

  return tree.map((treeItem, signalIndex) => {
    const { rangeKey, signalKey } = treeItem;

    return (
      <Tree
        key={rangeKey + signalKey}
        treeNodes={treeItem}
        startY={startY}
        signalIndex={signalIndex}
        range={range}
      />
    );
  });
}

interface TreeProps {
  startY: number;
  treeNodes: TreeNodes;
  signalIndex: number;
  range: Range;
}

function Tree(props: TreeProps) {
  const {
    signalIndex,
    range,
    startY: originStartY,
    treeNodes: { multiplicity, nodes, min, max, signalKey, diaIDs },
  } = props;
  const { from, to } = range;
  const { width } = useChartData();
  const { scaleX } = useScaleChecked();
  const dispatch = useDispatch();
  const assignmentData = useAssignmentData();

  const assignment = useAssignment(signalKey);
  const highlight = useHighlight(extractID(assignment), {
    type: HighlightEventSource.SIGNAL,
  });

  if (!multiplicity) return null;

  let widthRatio = 0;
  let treeWidth = 0;

  if (nodes?.length > 1) {
    treeWidth = scaleX()(min) - scaleX()(max);
    widthRatio = treeWidth / width;
  } else {
    treeWidth = 5;
    widthRatio = (scaleX()(from) - scaleX()(to)) / width;
  }

  const tailLength = widthRatio * tailLengthScale;
  const rationTextSize = widthRatio * 20;
  let multiplicityTextSize = rationTextSize;

  if (multiplicityTextSize < 10) {
    multiplicityTextSize = 10;
  }

  const isMassive = ['m', 's'].includes(multiplicity);
  const levelLength = isMassive ? tailLength : tailLength * 2;

  const treeHeight = multiplicity.split('').length * levelLength + tailLength;
  const startY = originStartY - treeHeight;

  const [{ x: head }, ...otherNodes] = nodes;
  const headX = scaleX()(head);
  const paths: Record<number, string[]> = {};

  for (const node of otherNodes) {
    const { x, parentX = 0, level } = node;

    const baseX = scaleX()(parentX);
    const x1 = scaleX()(x);
    const y = levelLength * (level - 1) + tailLength;

    const path = `M ${baseX} ${startY + y} L ${x1} ${startY + y + (isMassive ? 0 : tailLength)} l 0 ${tailLength}`;

    if (!paths?.[level]) {
      paths[level] = [path];
    } else {
      paths[level].push(path);
    }
  }

  function assignHandler() {
    assignment.setActive('x');
  }

  function unAssignHandler() {
    dispatch({
      type: 'UNLINK_RANGE',
      payload: {
        range,
        assignmentData,
        signalIndex,
      },
    });
  }

  const isHighlighted = highlight.isActive || assignment.isActive;
  const padding = boxPadding * widthRatio;

  return (
    <g
      style={
        isHighlighted ? { ...styles, opacity: 1, strokeWidth: 1.5 } : styles
      }
      onMouseEnter={() => {
        assignment.show('x');
        highlight.show();
      }}
      onMouseLeave={() => {
        assignment.hide();
        highlight.hide();
      }}
      pointerEvents="bounding-box"
      {...(!assignment.isActive && { css: cssStyle })}
    >
      <rect
        x={headX - padding - treeWidth / 2}
        y={startY - padding}
        width={treeWidth + padding * 2}
        height={treeHeight + (multiplicity !== 's' ? tailLength : 0)}
        fill={isHighlighted ? '#ff6f0057' : 'transparent'}
        data-no-export="true"
      />
      <text
        x={headX}
        y={startY - headTextMargin}
        textAnchor="middle"
        fontSize={multiplicityTextSize}
        fill="black"
      >
        {multiplicity}
      </text>
      <line
        x1={headX}
        x2={headX}
        y1={startY}
        y2={startY + tailLength}
        stroke={TREE_LEVEL_COLORS[0]}
      />
      <g>
        {Object.keys(paths).map((level) => {
          return (
            <path
              key={level}
              d={paths[level].join(' ')}
              fill="none"
              stroke={
                isMassive
                  ? 'blue'
                  : TREE_LEVEL_COLORS[Number(level) - 1] || 'black'
              }
            />
          );
        })}
      </g>
      <g>
        {!isMassive &&
          otherNodes.map((node) => {
            const { x, level, ratio } = node;
            const x1 = scaleX()(x);

            const y = levelLength * (level - 1) + tailLength + tailLength / 2;

            return (
              <text
                key={JSON.stringify(node)}
                x={x1}
                y={startY + y}
                textAnchor="middle"
                alignmentBaseline="middle"
                fontSize={rationTextSize}
                fill={TREE_LEVEL_COLORS[Number(level) - 1]}
              >
                {ratio}
              </text>
            );
          })}
      </g>
      <AssignmentActionsButtons
        className="signal-target"
        isActive={!!(assignment.isActive || diaIDs)}
        y={startY - 16}
        x={headX - 30}
        onAssign={assignHandler}
        onUnAssign={unAssignHandler}
        borderRadius={16}
      />
    </g>
  );
}

function getMaxY(spectrum: Spectrum1D, options: { from: number; to: number }) {
  const { from, to } = options;
  const {
    data: { re, x },
  } = spectrum;
  const fromIndex = xFindClosestIndex(x, from);
  const toIndex = xFindClosestIndex(x, to);
  let max = Number.NEGATIVE_INFINITY;
  for (const value of re.slice(fromIndex, toIndex)) {
    if (value > max) {
      max = value;
    }
  }
  return max;
}

function extractID(assignment: AssignmentsData) {
  return [assignment.id].concat(assignment.assigned?.x || []);
}
