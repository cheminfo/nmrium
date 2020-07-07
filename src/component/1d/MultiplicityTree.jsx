/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo, useCallback, useState, useEffect } from 'react';

import { useChartData } from '../context/ChartContext';
import { useScale } from '../context/ScaleContext';
import { useHighlight } from '../highlight';
import {
  isOnRangeLevel,
  getPascal,
  getMultiplicity,
  hasCouplingConstant,
} from '../panels/extra/utilities/MultiplicityUtilities';

const styles = {
  cursor: 'default',
  opacity: 0.6,
  strokeWidth: 1,
};

const colors = ['red', 'green', 'blue', 'magenta'];

const MultiplicityTree = ({
  rangeFrom,
  rangeTo,
  signal,
  highlightID,
  options = {
    label: { distance: 10, fontSize: 11 },
  },
}) => {
  const { scaleX, scaleY } = useScale();
  const {
    data: spectraData,
    activeSpectrum,
    showMultiplicityTrees,
  } = useChartData();
  const highlight = useHighlight([highlightID]);

  const spectrumData = useMemo(() => {
    return spectraData && activeSpectrum && spectraData[activeSpectrum.index]
      ? spectraData[activeSpectrum.index]
      : null;
  }, [activeSpectrum, spectraData]);

  const [xRange, setXRange] = useState({ x1: signal.delta, x2: signal.delta });
  const [treeProps, setTreeProps] = useState({
    width: 0,
    height: 0,
    levelHeight: 0,
  });

  useEffect(() => {
    const _isOnRangeLevel = isOnRangeLevel(signal.multiplicity);
    const _treeWidth = _isOnRangeLevel
      ? Math.abs(scaleX()(xRange.x1) - scaleX()(xRange.x2))
      : Math.abs(scaleX()(xRange.x1) - scaleX()(xRange.x2)) +
        options.label.distance;
    const _treeHeight = _isOnRangeLevel ? _treeWidth / 3 : _treeWidth / 2;
    // +2 because of multiplicity text and start level node before the actual tree starts
    // 2* for levels between nodes (edges)
    const _treeLevelHeight = _isOnRangeLevel
      ? _treeHeight / (signal.multiplicity.length + 2)
      : _treeHeight / (2 * signal.multiplicity.length + 2);

    setTreeProps({
      width: _treeWidth,
      height: _treeHeight,
      levelHeight: _treeLevelHeight,
    });
  }, [
    options.label.distance,
    scaleX,
    signal.multiplicity,
    xRange.x1,
    xRange.x2,
  ]);

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

  // recursive function
  const buildTreeNodesData = useCallback(
    (multiplicityIndex, jIndices, treeNodesData, startX) => {
      if (multiplicityIndex >= signal.multiplicity.length) {
        return treeNodesData;
      }
      // re-use colors if needed
      const color = colors[multiplicityIndex % colors.length];

      const jIndex = jIndices.findIndex(
        (_jIndex) => _jIndex === multiplicityIndex,
      );
      const coupling =
        jIndex >= 0 && spectrumData.info && spectrumData.info.originFrequency
          ? signal.j[jIndex].coupling / spectrumData.info.originFrequency // convert to ppm
          : null;

      // in case of "s": no coupling constant and build one tree node only
      if (!coupling) {
        treeNodesData.push({
          startX,
          _startX: startX,
          ratio: 1,
          multiplicityIndex,
          color,
        });
        // go to next multiplet in multiplicity string
        buildTreeNodesData(
          multiplicityIndex + 1,
          jIndices,
          treeNodesData,
          startX,
        );
      } else {
        // in case of other multiplets
        const pascal = getPascal(
          getMultiplicity(signal.multiplicity.charAt(multiplicityIndex)),
          0.5,
        ); // @TODO for now we use the default spin of 1 / 2 only

        let _startX =
          pascal.length % 2 === 0
            ? startX - (pascal.length / 2) * coupling + coupling / 2 // in case of even number of nodes
            : startX - (pascal.length / 2 - 0.5) * coupling; // in case of odd number of nodes

        pascal.forEach((ratio, k) => {
          if (k > 0) {
            _startX += coupling;
          }
          treeNodesData.push({
            startX,
            _startX,
            ratio,
            multiplicityIndex,
            color,
          });
          // go to next multiplet in multiplicity string
          buildTreeNodesData(
            multiplicityIndex + 1,
            jIndices,
            treeNodesData,
            _startX,
          );
        });
      }

      return treeNodesData;
    },
    [signal.multiplicity, signal.j, spectrumData.info],
  );

  const treeNodesData = useMemo(() => {
    const jIndices = signal.multiplicity
      .split('')
      .map((_mult, i) => (hasCouplingConstant(_mult) ? i : undefined))
      .filter((_i) => _i !== undefined);

    return buildTreeNodesData(0, jIndices, [], signal.delta);
  }, [buildTreeNodesData, signal]);

  const buildTreeNodeAndEdge = useCallback(
    ({ startX, _startX, ratio, multiplicityIndex, color }) => {
      const edgeLevel = 2 * multiplicityIndex + 2;
      const _startYEdge = startY + edgeLevel * treeProps.levelHeight;
      const _startYNode = startY + (edgeLevel + 1) * treeProps.levelHeight;

      return (
        <g key={`treeNode_${highlightID}_${startX}_${_startX}_${ratio}`}>
          {/* ratio text */}
          <text
            textAnchor="middle"
            x={scaleX()(_startX) + options.label.distance}
            y={_startYNode + treeProps.levelHeight / 2}
            fontSize={options.label.fontSize}
            fill={color}
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
            y2={_startYNode + treeProps.levelHeight}
            stroke={color}
          />
        </g>
      );
    },
    [
      highlightID,
      options.label.distance,
      options.label.fontSize,
      scaleX,
      startY,
      treeProps.levelHeight,
    ],
  );

  useEffect(() => {
    if (isOnRangeLevel(signal.multiplicity)) {
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
  }, [rangeFrom, rangeTo, signal.delta, signal.multiplicity, treeNodesData]);

  const multiplicityTree = useMemo(() => {
    // first tree level
    let _startY = startY;
    const multiplicityString = (
      <text
        key={`multiplicityString_${highlightID}`}
        textAnchor="middle"
        x={scaleX()(signal.delta)}
        y={_startY + treeProps.levelHeight / 2}
        fontSize={options.label.fontSize}
        lengthAdjust="spacing"
        fill="black"
      >
        {signal.multiplicity}
      </text>
    );

    // second tree level
    _startY = startY + treeProps.levelHeight;
    const startLevelNode = (
      <line
        key={`startLevelNode_${highlightID}`}
        x1={scaleX()(signal.delta)}
        y1={_startY}
        x2={scaleX()(signal.delta)}
        y2={_startY + treeProps.levelHeight}
        stroke={colors[0]}
      />
    );
    // third tree level
    _startY += treeProps.levelHeight;

    if (isOnRangeLevel(signal.multiplicity)) {
      const _rangeFrom = scaleX()(rangeFrom);
      const _rangeTo = scaleX()(rangeTo);

      const pathData = `M ${_rangeFrom} ${
        _startY + treeProps.levelHeight
      } ${_rangeFrom} ${_startY} ${scaleX()(
        signal.delta,
      )} ${_startY} ${_rangeTo} ${_startY} ${_rangeTo} ${
        _startY + treeProps.levelHeight
      }`;

      return (
        <g>
          {multiplicityString}
          {startLevelNode}
          <path d={pathData} stroke="blue" fill="none" />
        </g>
      );
    }

    const tree = [].concat(
      [multiplicityString],
      [startLevelNode],
      treeNodesData.map((_treeNodeData) => buildTreeNodeAndEdge(_treeNodeData)),
    );

    return <g>{tree}</g>;
  }, [
    startY,
    highlightID,
    scaleX,
    signal.delta,
    signal.multiplicity,
    treeProps,
    options.label.fontSize,
    treeNodesData,
    rangeFrom,
    rangeTo,
    buildTreeNodeAndEdge,
  ]);

  return showMultiplicityTrees && showMultiplicityTrees === true ? (
    <g
      css={
        highlight.isActive || highlight.isActivePermanently
          ? { ...styles, opacity: 1, strokeWidth: 1.5 }
          : styles
      }
      {...highlight.onHover}
      {...highlight.onClick}
    >
      {multiplicityTree}
    </g>
  ) : null;
};

export default MultiplicityTree;
