/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo } from 'react';

import { useChartData } from '../context/ChartContext';
import { useScale } from '../context/ScaleContext';
import { useHighlight } from '../highlight';
import { isOnRangeLevel } from '../panels/extra/utilities/MultiplicityUtilities';

const MultiplicityTree = ({
  rangeFrom,
  rangeTo,
  signal,
  highlightID,
  options = { level: { distance: 15 }, node: { height: 10, width: 3 } },
}) => {
  const { scaleX, scaleY } = useScale();
  const { data: spectraData, activeSpectrum } = useChartData();
  const highlight = useHighlight([highlightID]);

  const spectrumData = useMemo(() => {
    return spectraData && activeSpectrum && spectraData[activeSpectrum.index]
      ? spectraData[activeSpectrum.index]
      : null;
  }, [activeSpectrum, spectraData]);

  const SignalDeltaX = useMemo(() => {
    return scaleX()(signal.delta);
  }, [scaleX, signal.delta]);

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

  const multiplicityTree = useMemo(() => {
    const startLevel = (
      <rect
        className="startLevel"
        x={scaleX()(signal.delta) - options.node.width / 2}
        y={startY - options.level.distance}
        height={options.node.height}
        width={options.node.width}
        fill="red"
      />
    );

    if (isOnRangeLevel(signal.multiplicity)) {
      const pathData = `M ${scaleX()(rangeFrom)} ${
        startY + options.level.distance
      } ${scaleX()(rangeFrom)} ${startY} ${SignalDeltaX} ${startY} ${scaleX()(
        rangeTo,
      )} ${startY} ${scaleX()(rangeTo)} ${startY + options.level.distance}`;

      return (
        <g>
          {startLevel}
          <path d={pathData} stroke="blue" strokeWidth={2} fill="none" />
        </g>
      );
    }

    return (
      <g>
        {startLevel}
        {/* {signal.multiplicity.split('').map((mult, i) => (
          <rect
            // eslint-disable-next-line react/no-array-index-key
            key={`level${i}`}
            className="level"
            x={scaleX()(signal.delta)}
            y={_scaleY(yPosition) - i * levelOptions.vDistance}
            height={options.node.height}
            width={3}
            fill="green"
          />
        ))} */}
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
    rangeFrom,
    SignalDeltaX,
    rangeTo,
  ]);

  return (
    <g {...highlight.onHover}>
      <text
        textAnchor="middle"
        x={SignalDeltaX}
        y={startY - 2 * options.level.distance}
        fontSize="12"
        fill="blue"
      >
        {signal.multiplicity}
      </text>
      {multiplicityTree}
    </g>
  );
};

export default MultiplicityTree;
