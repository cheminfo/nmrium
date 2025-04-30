import styled from '@emotion/styled';
import type { Spectrum1D } from '@zakodium/nmrium-core';

import { useChartData } from '../../context/ChartContext.js';
import { useTracesSpectra } from '../useTracesSpectra.js';
import { extractSpectrumSignals } from '../utilities/extractSpectrumSignals.js';
import type { BaseSignal } from '../utilities/extractSpectrumSignals.js';
import { useScale2DX, useScale2DY } from '../utilities/scale.js';

const IndicatorLine = styled.line`
  stroke: lightgrey;
  opacity: 0.7;
`;

type IndicationLinesAxis = 'x' | 'y';
interface SignalsGuideLinesProps {
  axis: IndicationLinesAxis;
}

interface IndicationLinesProps extends SignalsGuideLinesProps {
  spectrum: Spectrum1D;
}

const labelSize = 12;
const padding = 2;

interface ProcessedSignal extends BaseSignal {
  labelWidth: number;
  deltaInPixel: number;
}

function useSignalsOverlap(axis: IndicationLinesAxis, spectrum: Spectrum1D) {
  const signals = extractSpectrumSignals(spectrum);
  const scaleX = useScale2DX();
  const scaleY = useScale2DY();

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!signals || !context) return null;

  context.font = `${labelSize}px Arial`;
  const isOverXAxis = axis === 'x';

  const processedSignals: ProcessedSignal[] = signals
    .map((signal) => {
      const { delta } = signal;
      const text = signal.assignment ?? '';
      const { width: labelWidth } = context.measureText(text);

      return {
        ...signal,
        labelWidth,
        deltaInPixel: isOverXAxis ? scaleX(delta) : scaleY(delta),
      };
    })
    .sort((a, b) => (isOverXAxis ? b.delta - a.delta : a.delta - b.delta));

  const groups: any[][] = [];
  let currentGroup: any[] = [];
  let lastInPixel = 0;

  for (const signal of processedSignals) {
    const deltaInPixel = signal.deltaInPixel;

    if (deltaInPixel < lastInPixel) {
      currentGroup.push(signal);
    } else {
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }
      currentGroup = [signal];
    }
    lastInPixel = deltaInPixel + signal.labelWidth + padding;
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup); // Push the last group after the loop
  }
  return groups.flatMap((group) => {
    let i = 0;
    return group.map((item) => {
      const stackIndex = i;
      if (item.assignment) {
        i++;
      }
      return {
        ...item,
        stackIndex,
      };
    });
  });
}

function IndicationLines(props: IndicationLinesProps) {
  const { axis, spectrum } = props;
  const { margin, width, height } = useChartData();
  const normalizedSignals = useSignalsOverlap(axis, spectrum);

  if (!normalizedSignals) return null;

  return (
    <g>
      {normalizedSignals.map(({ deltaInPixel, stackIndex, assignment, id }) => {
        const isOverXAxis = axis === 'x';
        const x = isOverXAxis ? deltaInPixel : margin.left;
        const y = isOverXAxis ? margin.top : deltaInPixel;

        const x2 = isOverXAxis ? 0 : width - margin.left - margin.right;
        const y2 = isOverXAxis ? height - margin.top - margin.bottom : 0;

        const labelX = isOverXAxis ? padding : padding + stackIndex * labelSize;
        const labelY = isOverXAxis
          ? padding + stackIndex * labelSize
          : -padding;

        return (
          <g key={`${axis}[${id}]`} transform={`translate(${x},${y})`}>
            <IndicatorLine x1={0} x2={x2} y1={0} y2={y2} />
            {assignment && (
              <text
                x={labelX}
                y={labelY}
                fontSize={labelSize}
                fill="#555"
                dominantBaseline="hanging"
                textAnchor="start"
                transform={
                  isOverXAxis ? undefined : `rotate(-90 ${labelX} ${labelY})`
                }
              >
                {assignment}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

export function SignalsGuideLines() {
  const spectrumData = useTracesSpectra();

  if (!spectrumData) return null;

  return (
    <>
      {spectrumData[0] && (
        <IndicationLines axis="x" spectrum={spectrumData[0]} />
      )}
      {spectrumData[0] && (
        <IndicationLines axis="y" spectrum={spectrumData[1]} />
      )}
    </>
  );
}
