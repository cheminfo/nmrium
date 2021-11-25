/** @jsxImportSource @emotion/react */
import lodashGet from 'lodash/get';
import { useMemo, useState, useEffect, CSSProperties } from 'react';

import { Signal1D } from '../../../data/types/data1d';
import { useAssignment } from '../../assignment';
import { useChartData } from '../../context/ChartContext';
import { useScaleChecked } from '../../context/ScaleContext';
import { HighlightedSource, useHighlight } from '../../highlight';
import {
  hasCouplingConstant,
  checkMultiplicity,
} from '../../panels/extra/utilities/MultiplicityUtilities';
import { options } from '../../toolbar/ToolTypes';

import LevelNode from './LevelNode';
import StringNode from './StringNode';
import TreeNodes from './TreeNodes';
import createTreeNodes from './buildTreeNode';

const styles = {
  cursor: 'default',
  opacity: 0.6,
  strokeWidth: 1,
};

// export interface SignalNodeProps {
//   id: string;
//   delta: number;
//   multiplicity: string;
// }

interface MultiplicityTreeProps {
  rangeFrom: number;
  rangeTo: number;
  signal: Signal1D;
  labelOptions?: {
    distance: number;
    fontSize: CSSProperties['fontSize'];
  };
}

function extractID(assignment) {
  return [assignment.id].concat(assignment.assigned.x || []);
}

function MultiplicityTree({
  rangeFrom,
  rangeTo,
  signal,
  labelOptions = {
    distance: 10,
    fontSize: 11,
  },
}: MultiplicityTreeProps) {
  const { scaleX, scaleY } = useScaleChecked();
  const {
    data: spectraData,
    activeSpectrum,
    toolOptions: { selectedTool },
    width,
  } = useChartData();
  const assignment = useAssignment(signal.id);
  const highlight = useHighlight(extractID(assignment), {
    type: HighlightedSource.SIGNAL,
    extra: extractID(assignment),
  });

  const spectrumData = useMemo(
    () =>
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      lodashGet(spectraData, `${activeSpectrum?.index}`, null),
    [activeSpectrum, spectraData],
  );

  const [xRange, setXRange] = useState({ x1: signal.delta, x2: signal.delta });
  const [treeProps, setTreeProps] = useState({
    width: 0,
    height: 0,
    levelHeight: 0,
  });
  const [drawInFullRange, setDrawInFullRange] = useState(false);
  const [showLabels, setShowLabels] = useState(false);

  useEffect(() => {
    const _drawInFullRange = !checkMultiplicity(signal.multiplicity, ['m']);
    const _treeWidth = _drawInFullRange
      ? Math.abs(scaleX()(xRange.x1) - scaleX()(xRange.x2))
      : Math.abs(scaleX()(xRange.x1) - scaleX()(xRange.x2)) +
        labelOptions.distance;
    const _treeHeight = _drawInFullRange ? _treeWidth / 3 : _treeWidth / 2;
    // +2 because of multiplicity text and start level node before the actual tree starts
    // 2* for levels between nodes (edges)
    const length = signal?.multiplicity?.length || 0;
    const _treeLevelHeight = _drawInFullRange
      ? _treeHeight / (length + 2)
      : _treeHeight / (2 * length + 2);

    setTreeProps({
      width: _treeWidth,
      height: _treeHeight,
      levelHeight: _treeLevelHeight,
    });
    setDrawInFullRange(_drawInFullRange);
  }, [
    labelOptions.distance,
    scaleX,
    signal.multiplicity,
    xRange.x1,
    xRange.x2,
  ]);

  useEffect(() => {
    if (treeProps.width / width >= 0.1) {
      setShowLabels(true);
    } else {
      setShowLabels(false);
    }
  }, [treeProps.width, width]);

  const startY = useMemo(() => {
    let yMax;
    spectrumData.data.x.forEach((_x, i) => {
      if (
        _x >= rangeFrom &&
        _x <= rangeTo &&
        (!yMax || spectrumData.data.re[i] > yMax)
      ) {
        yMax = spectrumData.data.re[i];
      }
    });

    return scaleY(spectrumData.id)(yMax) - treeProps.height - 30;
  }, [
    spectrumData.data.x,
    spectrumData.data.re,
    spectrumData.id,
    scaleY,
    treeProps.height,
    rangeFrom,
    rangeTo,
  ]);

  const treeNodesData = useMemo(() => {
    if (signal.multiplicity) {
      const buildTreeNodesData = createTreeNodes(signal, spectrumData);
      const jIndices = signal.multiplicity
        .split('')
        .map((_mult, i) => (hasCouplingConstant(_mult) ? i : undefined))
        .filter((_i) => _i !== undefined);

      return buildTreeNodesData(0, jIndices, [], signal.delta);
    }
    return [];
  }, [signal, spectrumData]);

  useEffect(() => {
    if (drawInFullRange) {
      setXRange({ x1: rangeFrom, x2: rangeTo });
    } else {
      const _xRange = { x1: signal.delta, x2: signal.delta };
      treeNodesData.forEach((_treeNodeData) => {
        if (_treeNodeData.startX < _xRange.x1) {
          _xRange.x1 = _treeNodeData.startX;
        }
        if (_treeNodeData.startX > _xRange.x2) {
          _xRange.x2 = _treeNodeData.startX;
        }
        if (_treeNodeData._startX < _xRange.x1) {
          _xRange.x1 = _treeNodeData._startX;
        }
        if (_treeNodeData._startX > _xRange.x2) {
          _xRange.x2 = _treeNodeData._startX;
        }
      });
      setXRange(_xRange);
    }
  }, [
    drawInFullRange,
    rangeFrom,
    rangeTo,
    signal.delta,
    signal.multiplicity,
    treeNodesData,
  ]);

  const multiplicityTree = useMemo(() => {
    const { levelHeight } = treeProps;
    // first tree level
    const firstLevelStartY = startY;
    let _startY = firstLevelStartY;
    // second tree level
    const secondLevelStartY = startY + levelHeight;
    _startY = secondLevelStartY;

    // third tree level
    _startY += levelHeight;

    if (drawInFullRange) {
      const _rangeFrom = scaleX()(rangeFrom);
      const _rangeTo = scaleX()(rangeTo);

      const pathData = `M ${_rangeFrom} ${
        _startY + levelHeight
      } ${_rangeFrom} ${_startY} ${scaleX()(
        signal.delta,
      )} ${_startY} ${_rangeTo} ${_startY} ${_rangeTo} ${
        _startY + levelHeight
      }`;

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
          nodesData={treeNodesData}
          signalID={treeNodesData}
          showLabels={showLabels}
          startY={startY}
          labelOptions={labelOptions}
          levelHeight={levelHeight}
        />
      </g>
    );
  }, [
    treeProps,
    startY,
    drawInFullRange,
    signal,
    labelOptions,
    showLabels,
    treeNodesData,
    scaleX,
    rangeFrom,
    rangeTo,
  ]);

  return (
    <g
      css={
        highlight.isActive || assignment.isActive
          ? { ...styles, opacity: 1, strokeWidth: 1.5 }
          : styles
      }
      {...{
        onMouseEnter: () => {
          assignment.onMouseEnter('x');
          highlight.show();
        },
        onMouseLeave: () => {
          assignment.onMouseLeave('x');
          highlight.hide();
        },
      }}
      {...{
        onClick:
          selectedTool && selectedTool === options.editRange.id
            ? () => {
                return null;
              }
            : (e) => {
                if (e.shiftKey) {
                  e.stopPropagation();
                  assignment.onClick('x');
                }
              },
      }}
    >
      {multiplicityTree}
    </g>
  );
}

export default MultiplicityTree;
