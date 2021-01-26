/** @jsxImportSource @emotion/react */
import lodash from 'lodash';
import { useMemo, useState, useEffect } from 'react';

import { useAssignment } from '../../assignment';
import { useChartData } from '../../context/ChartContext';
import { useScale } from '../../context/ScaleContext';
import { useHighlight } from '../../highlight';
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

function MultiplicityTree({
  rangeFrom,
  rangeTo,
  signal,
  labelOptions = {
    distance: 10,
    fontSize: 11,
  },
}) {
  const { scaleX, scaleY } = useScale();
  const {
    data: spectraData,
    activeSpectrum,
    selectedTool,
    width,
  } = useChartData();
  const assignment = useAssignment(signal.id);
  const highlight = useHighlight(
    [assignment.id].concat(assignment.assigned.x || []),
  );

  const spectrumData = useMemo(
    () => lodash.get(spectraData, `${activeSpectrum.index}`, null),
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
    const _treeLevelHeight = _drawInFullRange
      ? _treeHeight / (signal.multiplicity.length + 2)
      : _treeHeight / (2 * signal.multiplicity.length + 2);

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
    spectrumData.x.forEach((_x, i) => {
      if (
        _x >= rangeFrom &&
        _x <= rangeTo &&
        (!yMax || spectrumData.y[i] > yMax)
      ) {
        yMax = spectrumData.y[i];
      }
    });

    return scaleY(spectrumData.id)(yMax) - treeProps.height - 30;
  }, [
    spectrumData.x,
    spectrumData.id,
    spectrumData.y,
    scaleY,
    treeProps.height,
    rangeFrom,
    rangeTo,
  ]);

  const treeNodesData = useMemo(() => {
    const buildTreeNodesData = createTreeNodes(signal, spectrumData);
    const jIndices = signal.multiplicity
      .split('')
      .map((_mult, i) => (hasCouplingConstant(_mult) ? i : undefined))
      .filter((_i) => _i !== undefined);

    return buildTreeNodesData(0, jIndices, [], signal.delta);
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
            ? null
            : (e) => {
                if (e.shiftKey) {
                  assignment.onClick(e, 'x');
                }
              },
      }}
    >
      {multiplicityTree}
    </g>
  );
}

export default MultiplicityTree;
