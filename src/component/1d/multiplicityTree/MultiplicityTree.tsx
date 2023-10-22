/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Spectrum1D } from 'nmr-load-save';
import { Range, Signal1D, checkMultiplicity } from 'nmr-processing';
import { CSSProperties, useMemo } from 'react';

import {
  AssignmentsData,
  useAssignment,
} from '../../assignment/AssignmentsContext';
import { useChartData } from '../../context/ChartContext';
import { useScaleChecked } from '../../context/ScaleContext';
import { HighlightEventSource, useHighlight } from '../../highlight';
import useSpectrum from '../../hooks/useSpectrum';
import { hasCouplingConstant } from '../../panels/extra/utilities/MultiplicityUtilities';
import { AssignmentActionsButtons } from '../ranges/AssignmentActionsButtons';

import LevelNode from './LevelNode';
import StringNode from './StringNode';
import TreeNodes from './TreeNodes';
import createTreeNodes, { TreeNodeData } from './buildTreeNode';

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

const BOX_PADDING = 5;

interface InnerMultiplicityTreeProps extends MultiplicityTreeProps {
  data: any;
  width: number;
  index: number;
}

function extractID(assignment: AssignmentsData) {
  return [assignment.id].concat(assignment.assigned?.x || []);
}

function InnerMultiplicityTree({
  labelOptions,
  onUnlink,
  data,
  width: widthProp,
  index,
}: InnerMultiplicityTreeProps) {
  const { startX, signal, width, height, startY } = data;
  const { scaleX } = useScaleChecked();
  const showLabels = width / widthProp >= 0.1;
  labelOptions = labelOptions || {
    distance: 10,
    fontSize: 11,
  };

  const assignment = useAssignment(signal.id);
  const highlight = useHighlight(extractID(assignment), {
    type: HighlightEventSource.SIGNAL,
  });

  function assignHandler() {
    assignment.setActive('x');
  }

  function unAssignHandler() {
    onUnlink(index);
  }

  const isHighlighted = highlight.isActive || assignment.isActive;
  return (
    <g
      style={
        isHighlighted ? { ...styles, opacity: 1, strokeWidth: 1.5 } : styles
      }
      {...{
        onMouseEnter: () => {
          assignment.show('x');
          highlight.show();
        },
        onMouseLeave: () => {
          assignment.hide();
          highlight.hide();
        },
      }}
      pointerEvents="bounding-box"
      {...(!assignment.isActive && { css: cssStyle })}
    >
      {drawTree(data, { scaleX, labelOptions, showLabels })}
      <rect
        x={startX - BOX_PADDING}
        y={startY - BOX_PADDING}
        width={width + BOX_PADDING * 2}
        height={height + BOX_PADDING * 2}
        fill={isHighlighted ? '#ff6f0057' : 'transparent'}
        data-no-export="true"
      />
      <AssignmentActionsButtons
        className="signal-target"
        isActive={!!(assignment.isActive || signal?.diaIDs)}
        y={startY}
        x={scaleX()(signal.delta) - 30}
        onAssign={assignHandler}
        onUnAssign={unAssignHandler}
        borderRadius={16}
      />
    </g>
  );
}

interface MultiplicityTreeProps {
  range: Range;
  labelOptions?: {
    distance: number;
    fontSize: CSSProperties['fontSize'];
  };
  onUnlink: (index: number) => void;
}

export function MultiplicityTree(props: MultiplicityTreeProps) {
  const { width } = useChartData();
  const spectrum = useSpectrum(null);
  const { scaleX, scaleY } = useScaleChecked();
  const treeData = useMemo(
    () =>
      spectrum
        ? getTree(props.range, spectrum as Spectrum1D, { scaleX, scaleY })
        : [],
    [props.range, scaleX, scaleY, spectrum],
  );

  if (!spectrum) return null;

  return (
    <g>
      {treeData?.map((data, index) => (
        <InnerMultiplicityTree
          index={index}
          key={data.signal.id}
          data={data}
          width={width}
          {...props}
        />
      ))}
    </g>
  );
}
interface TreeResult {
  isMassive: boolean;
  startX: number;
  startY: number;
  width: number;
  height: number;
  levelHeight: number;
  nodes: TreeNodeData[];
  signal: Signal1D;
  range: Omit<Range, 'signals'>;
}
function getTree(range: Range, spectrum: Spectrum1D, scale) {
  const SHIFT_X = 30;

  const treeResult: TreeResult[] = [];

  const { signals = [], ...otherRangeProps } = range;
  for (const signal of signals) {
    const isMassive = !checkMultiplicity(signal.multiplicity, ['m']);
    const length = signal?.multiplicity?.length || 0;
    let width = 0;
    let height = 0;
    let levelHeight = 0;
    const nodes: TreeNodeData[] = [];
    let startX = 0;

    const { from, to } = range;

    if (signal.multiplicity) {
      const buildTreeNodesData = createTreeNodes(signal, spectrum);
      const jIndices = signal.multiplicity
        .split('')
        .map((_mult, i) => (hasCouplingConstant(_mult) ? i : undefined))
        .filter((i) => i !== undefined) as number[];

      const treeNodes = buildTreeNodesData(0, jIndices, [], signal.delta);
      if (treeNodes) nodes.push(...treeNodes);
    }

    // +2 because of multiplicity text and start level node before the actual tree starts
    // 2* for levels between nodes (edges)

    if (isMassive) {
      startX = scale.scaleX()(to);
      width = Math.abs(scale.scaleX()(from)) - Math.abs(startX);
      height = width / 3;
      levelHeight = height / (length + 2);
    } else {
      const treeRange = getTreeRange(nodes, signal.delta);
      startX = scale.scaleX()(treeRange.to);
      width = Math.abs(scale.scaleX()(treeRange.from)) - Math.abs(startX);
      height = width / 2;
      if (signal.multiplicity !== 's') {
        levelHeight = height / (2 * length + 2);
        height = width / 2;
      } else {
        levelHeight = 3;
        height = levelHeight * 4;
      }
    }

    const startY =
      scale.scaleY(spectrum.id)(getStartY(spectrum, { from, to })) -
      height -
      SHIFT_X;

    treeResult.push({
      isMassive,
      startX,
      startY,
      width,
      height,
      levelHeight,
      nodes,
      signal,
      range: otherRangeProps,
    });
  }
  return treeResult;
}

function getStartY(spectrum, options: { from: number; to: number }) {
  const {
    data: { x, re },
  } = spectrum;
  const { from, to } = options;
  let max = Number.NEGATIVE_INFINITY;
  for (const i in x) {
    if (x[i] >= from && x[i] <= to && re[i] > max) {
      max = re[i];
    }
  }
  return max;
}

function getTreeRange(nodes, delta: number) {
  const range = { from: delta, to: delta };
  for (const node of nodes) {
    if (node._startX < range.from) {
      range.from = node._startX;
    }
    if (node._startX > range.to) {
      range.to = node._startX;
    }
  }

  return range;
}

function drawTree(treeData, { scaleX, labelOptions, showLabels }) {
  const { isMassive, signal, levelHeight, range, nodes, startY } = treeData;

  // const { levelHeight } = treeProps;
  // first tree level
  const firstLevelStartY = startY;
  let _startY = firstLevelStartY;
  // second tree level
  const secondLevelStartY = startY + levelHeight;
  _startY = secondLevelStartY;

  // third tree level
  _startY += levelHeight;

  if (isMassive) {
    const _rangeFrom = scaleX()(range.from);
    const _rangeTo = scaleX()(range.to);

    const pathData = `M ${_rangeFrom} ${
      _startY + levelHeight
    } ${_rangeFrom} ${_startY} ${scaleX()(
      signal.delta,
    )} ${_startY} ${_rangeTo} ${_startY} ${_rangeTo} ${_startY + levelHeight}`;

    return (
      <g>
        <StringNode
          signal={signal}
          startY={firstLevelStartY}
          levelHeight={levelHeight}
          fontSize={labelOptions.fontSize}
          showLabels={showLabels}
        />
        <LevelNode
          signal={signal}
          startY={secondLevelStartY}
          levelHeight={levelHeight}
        />
        <path d={pathData} stroke="blue" fill="none" />
      </g>
    );
  }

  return (
    <g>
      <StringNode
        signal={signal}
        startY={firstLevelStartY}
        levelHeight={levelHeight}
        fontSize={labelOptions.fontSize}
        showLabels={showLabels}
      />
      <LevelNode
        signal={signal}
        startY={secondLevelStartY}
        levelHeight={levelHeight}
      />
      <TreeNodes
        nodesData={nodes}
        signalID={nodes}
        showLabels={showLabels}
        startY={startY}
        labelOptions={labelOptions}
        levelHeight={levelHeight}
      />
    </g>
  );
}
