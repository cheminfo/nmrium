import styled from '@emotion/styled';
import { xFindClosestIndex } from 'ml-spectra-processing';
import type { Spectrum1D } from 'nmr-load-save';
import type { Range } from 'nmr-processing';

import { isSpectrum1D } from '../../../data/data1d/Spectrum1D/index.js';
import type { AssignmentsData } from '../../assignment/AssignmentsContext.js';
import {
  useAssignment,
  useAssignmentData,
} from '../../assignment/AssignmentsContext.js';
import { useChartData } from '../../context/ChartContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { useScaleChecked } from '../../context/ScaleContext.js';
import { HighlightEventSource, useHighlight } from '../../highlight/index.js';
import useSpectrum from '../../hooks/useSpectrum.js';
import { AssignmentActionsButtons } from '../ranges/AssignmentActionsButtons.js';

import type { TreeNodes } from './generateTreeNodes.js';
import { generateTreeNodes } from './generateTreeNodes.js';

const Group = styled.g<{ isActive: boolean; isHighlighted: boolean }>`
  cursor: default;
  opacity: ${({ isHighlighted }) => (isHighlighted ? '1' : '0.6')};
  stroke-width: ${({ isHighlighted }) => (isHighlighted ? '1.5' : '1')}px;

  .signal-target {
    visibility: ${({ isActive }) => (isActive ? 'visible' : 'hidden')};
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

const treeLevelsColors: string[] = ['red', 'green', 'blue', 'magenta'];
const marginBottom = 20;
const headTextMargin = 5;
const tailLengthScale = 60;
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
    treeNodes: { multiplicity = '', nodes, min, max, signalKey, diaIDs },
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

  let widthRatio: number;
  let treeWidth: number;

  if (nodes?.length > 1) {
    treeWidth = scaleX()(min) - scaleX()(max);
    widthRatio = treeWidth / width;
  } else {
    treeWidth = 4;
    widthRatio = (scaleX()(from) - scaleX()(to)) / width;
  }

  const tailLength = widthRatio * tailLengthScale;
  const rationTextSize = widthRatio * 30;
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
  const paths = useTreePaths(otherNodes, {
    isMassive,
    levelLength,
    tailLength,
    startY,
  });

  if (!multiplicity) return null;

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
  const x = scaleX()(max) - padding;
  const y = startY - headTextMargin - multiplicityTextSize - padding;
  const boxWidth = treeWidth + padding * 2;
  const boxHeight =
    treeHeight + headTextMargin + multiplicityTextSize + padding * 2;

  return (
    <Group
      isActive={assignment.isActive}
      isHighlighted={isHighlighted}
      onMouseEnter={() => {
        assignment.show('x');
        highlight.show();
      }}
      onMouseLeave={() => {
        assignment.hide();
        highlight.hide();
      }}
      pointerEvents="bounding-box"
    >
      <rect
        x={x}
        y={y}
        width={boxWidth}
        height={boxHeight}
        fill={isHighlighted ? '#ff6f0057' : 'transparent'}
        data-no-export="true"
      />
      <g className="multiplicity-tree-head">
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
          stroke={treeLevelsColors[0]}
        />
      </g>
      <g className="multiplicity-tree-lines">
        {paths.map((path, level) => {
          const levelColor = isMassive
            ? 'blue'
            : treeLevelsColors[level % treeLevelsColors.length];
          return (
            <path
              key={path.join(`%${level}`)}
              d={path.join(' ')}
              fill="none"
              stroke={levelColor}
            />
          );
        })}
      </g>
      <g className="multiplicity-tree-ration-labels">
        {!isMassive &&
          otherNodes.map((node, index) => {
            const { x, level, ratio } = node;
            const x1 = scaleX()(x);

            const y = levelLength * level + tailLength + tailLength / 2;
            const levelColor =
              treeLevelsColors[level % treeLevelsColors.length];

            return (
              <text
                key={index}
                x={x1}
                y={startY + y}
                textAnchor="middle"
                alignmentBaseline="middle"
                fontSize={rationTextSize}
                fill={levelColor}
              >
                {ratio}
              </text>
            );
          })}
      </g>
      <AssignmentActionsButtons
        className="signal-target"
        isActive={
          assignment.isActive || (Array.isArray(diaIDs) && diaIDs.length > 0)
        }
        y={startY - 16}
        x={headX - 30}
        onAssign={assignHandler}
        onUnAssign={unAssignHandler}
        borderRadius={16}
      />
    </Group>
  );
}

function useTreePaths(
  otherNodes: TreeNodes['nodes'],
  options: {
    tailLength: number;
    levelLength: number;
    startY: number;
    isMassive: boolean;
  },
) {
  const { tailLength, levelLength, startY, isMassive } = options;
  const { scaleX } = useScaleChecked();

  const paths: string[][] = [];

  for (const node of otherNodes) {
    const { x, parentX = 0, level } = node;

    const baseX = scaleX()(parentX);
    const x1 = scaleX()(x);

    let y = tailLength;

    if (!isMassive) {
      y = levelLength * level + tailLength;
    }

    const path = `M ${baseX} ${startY + y} L ${x1} ${startY + y + (isMassive ? 0 : tailLength)} l 0 ${tailLength}`;

    if (!paths?.[level]) {
      paths[level] = [path];
    } else {
      paths[level].push(path);
    }
  }
  return paths;
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
