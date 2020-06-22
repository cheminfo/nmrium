/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useMemo, useCallback, useState } from 'react';

import { useChartData } from '../context/ChartContext';
import { useScale } from '../context/ScaleContext';
import { useHighlight } from '../highlight';
import {
  isOnRangeLevel,
  getPascal,
  getMultiplicity,
  hasCouplingConstant,
} from '../panels/extra/utilities/MultiplicityUtilities';

const stylesOnHover = css`
  pointer-events: bounding-box;
  @-moz-document url-prefix() {
    pointer-events: fill;
  }
  user-select: 'none';
  -webkit-user-select: none; /* Chrome all / Safari all */
  -moz-user-select: none; /* Firefox all */

  cursor: default;
  .rectangle {
    fill: #80808057;
  }
`;
const styles = css`
  pointer-events: bounding-box;
  @-moz-document url-prefix() {
    pointer-events: fill;
  }
  user-select: 'none';
  -webkit-user-select: none; /* Chrome all / Safari all */
  -moz-user-select: none; /* Firefox all */

  cursor: default;
  .rectangle {
    fill: #80808020;
  }
`;

const colors = ['red', 'green', 'blue', 'magenta'];

const MultiplicityTree = ({
  rangeFrom,
  rangeTo,
  signal,
  highlightID,
  options = {
    level: { distance: 20 },
    node: { height: 10, width: 3 },
    label: { distance: 5 },
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

  const _scaleY = useMemo(() => scaleY(spectrumData.id), [
    scaleY,
    spectrumData.id,
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

    return (
      _scaleY(yMax) - (signal.multiplicity.length + 1) * options.level.distance
    );
  }, [
    _scaleY,
    options.level.distance,
    rangeFrom,
    rangeTo,
    signal.multiplicity.length,
    spectrumData.x,
    spectrumData.y,
  ]);

  const [rectX, setRectX] = useState({ x1: signal.delta, x2: signal.delta });

  const addTreeNodes = useCallback(
    (multiplicityIndex, jIndices, treeNodes, startX) => {
      if (startX < rectX.x1) {
        setRectX({ x1: startX, x2: rectX.x2 });
      }
      if (startX > rectX.x2) {
        setRectX({ x1: rectX.x1, x2: startX });
      }

      if (multiplicityIndex >= signal.multiplicity.length) {
        return;
      }
      // re-use colors if needed
      const levelColor = colors[multiplicityIndex % colors.length];

      const buildNode = (_startX, ratio) => {
        return (
          <g key={`treeNode_${highlightID}_${startX}_${_startX}_${ratio}`}>
            <text
              textAnchor="middle"
              x={scaleX()(_startX) + options.label.distance}
              y={
                startY +
                multiplicityIndex * options.level.distance +
                options.node.height
              }
              fontSize="10"
            >
              {ratio}
            </text>
            <line
              x1={scaleX()(startX)}
              y1={
                startY +
                (multiplicityIndex - 1) * options.level.distance +
                options.node.height
              }
              x2={scaleX()(_startX)}
              y2={startY + multiplicityIndex * options.level.distance}
              stroke={levelColor}
              strokeWidth={1}
            />
            <rect
              x={scaleX()(_startX) - options.node.width / 2}
              y={startY + multiplicityIndex * options.level.distance}
              height={options.node.height}
              width={options.node.width}
              fill={levelColor}
            />
          </g>
        );
      };

      const jIndex = jIndices.findIndex(
        (_jIndex) => _jIndex === multiplicityIndex,
      );
      const coupling =
        jIndex >= 0 && spectrumData.info && spectrumData.info.frequency
          ? signal.j[jIndex].coupling / spectrumData.info.frequency // convert to ppm
          : null;

      // in case of "s": no coupling constant and build one tree node only
      if (!coupling) {
        treeNodes.push(buildNode(startX, 1));
        addTreeNodes(multiplicityIndex + 1, jIndices, treeNodes, startX);
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
          treeNodes.push(buildNode(_startX, ratio));
          addTreeNodes(multiplicityIndex + 1, jIndices, treeNodes, _startX);
        });
      }
    },
    [
      highlightID,
      options.label.distance,
      options.level.distance,
      options.node.height,
      options.node.width,
      rectX.x1,
      rectX.x2,
      scaleX,
      signal.j,
      signal.multiplicity,
      spectrumData.info,
      startY,
    ],
  );

  const multiplicityTree = useMemo(() => {
    const startLevelNode = (
      <rect
        x={scaleX()(signal.delta) - options.node.width / 2}
        y={startY - options.level.distance}
        height={options.node.height}
        width={options.node.width}
        fill={colors[0]}
      />
    );

    if (isOnRangeLevel(signal.multiplicity)) {
      const _rangeFrom = scaleX()(rangeFrom);
      const _rangeTo = scaleX()(rangeTo);
      const pathData = `M ${_rangeFrom} ${
        startY + options.level.distance
      } ${_rangeFrom} ${startY} ${scaleX()(
        signal.delta,
      )} ${startY} ${_rangeTo} ${startY} ${_rangeTo} ${
        startY + options.level.distance
      }`;
      setRectX({ x1: rangeFrom, x2: rangeTo });

      return (
        <g>
          {startLevelNode}
          <path d={pathData} stroke="blue" strokeWidth={2} fill="none" />
        </g>
      );
    }

    const jIndices = signal.multiplicity
      .split('')
      .map((_mult, i) => (hasCouplingConstant(_mult) ? i : undefined))
      .filter((_i) => _i !== undefined);

    const tree = [startLevelNode];
    addTreeNodes(0, jIndices, tree, signal.delta);

    return (
      <g>
        {startLevelNode}
        {tree}
      </g>
    );
  }, [
    scaleX,
    signal.delta,
    signal.multiplicity,
    options.node.width,
    options.node.height,
    options.level.distance,
    startY,
    addTreeNodes,
    rangeFrom,
    rangeTo,
  ]);

  return showMultiplicityTrees && showMultiplicityTrees === true ? (
    <g
      css={
        highlight.isActive || highlight.isActivePermanently
          ? stylesOnHover
          : styles
      }
      {...highlight.onHover}
    >
      <rect
        className="rectangle"
        x={scaleX()(rectX.x2) - options.node.width / 2}
        y={startY - 3 * options.level.distance}
        width={
          isOnRangeLevel(signal.multiplicity)
            ? Math.abs(scaleX()(rectX.x1) - scaleX()(rectX.x2)) +
              options.node.width / 2
            : Math.abs(scaleX()(rectX.x1) - scaleX()(rectX.x2)) +
              options.node.width / 2 +
              options.label.distance
        }
        height={
          startY +
          signal.multiplicity.length * options.level.distance -
          (startY - 3 * options.level.distance)
        }
      />
      <text
        textAnchor="middle"
        x={scaleX()(signal.delta)}
        y={startY - 2 * options.level.distance}
        fontSize="12"
        fill="blue"
      >
        {signal.multiplicity}
      </text>
      {multiplicityTree}
    </g>
  ) : null;
};

export default MultiplicityTree;
