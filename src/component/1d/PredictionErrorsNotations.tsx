import { Popover } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { IdcodeSvgRenderer } from 'react-ocl';

import { isSpectrum1D } from '../../data/data1d/Spectrum1D/isSpectrum1D.js';
import { useAssignment } from '../assignment/AssignmentsContext.js';
import type { AssignmentsData } from '../assignment/AssignmentsContext.js';
import { useScaleChecked } from '../context/ScaleContext.js';
import { HighlightEventSource, useHighlight } from '../highlight/index.js';
import useSpectrum from '../hooks/useSpectrum.js';
import useCheckExperimentalFeature from '../hooks/useCheckExperimentalFeature.js';

const boxHeight = 10;
const boxPadding = 4;

const Rect = styled.rect<{ isHighlighted: boolean }>`
  fill: ${({ isHighlighted }) => (isHighlighted ? '#ff6f0057' : 'transparent')};

  &:hover {
    fill: #ff6f0057;
  }
`;
const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const InfoHeader = styled.div`
  display: flex;
  flex-direction: row;
`;

const BaseText = styled.span`
  text-align: center;
  flex: 1;
  font-size: 12px;
`;

const Text = styled(BaseText)`
  background-color: darkgray;
  color: white;
`;
const Value = styled(BaseText)`
  border-bottom: 1px solid darkgray;
  font-weight: bold;
`;
interface Statistics {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  mean: number;
  lowerWhisker: number;
  upperWhisker: number;
  nb: number;
}

interface Metadata {
  sphere: number;
  hose: string;
}

interface SignalStatistics {
  statistics: Statistics;
  metadata: Metadata;
  id: string;
}

function useStatistics() {
  const spectrum = useSpectrum();

  if (!isSpectrum1D(spectrum)) return;

  const ranges = spectrum?.ranges?.values;
  if (!Array.isArray(ranges) || ranges?.length === 0) {
    return [];
  }

  const result: SignalStatistics[] = [];
  for (const range of ranges) {
    const { signals = [] } = range;
    for (const signal of signals) {
      const { statistics, id, metadata } = signal as any;
      if (!statistics) continue;
      result.push({ id, statistics, metadata });
    }
  }

  return result;
}

export function PredictionErrorsNotations() {
  const data = useStatistics();

  if (!data || data?.length === 0) return null;

  return (
    <g transform={`translate(0,${boxHeight})`}>
      {data.map((datum, index) => (
        <g
          key={datum.id}
          transform={`translate(0,${index * (boxHeight + boxPadding * 2)})`}
        >
          <PredictionError {...datum} />
        </g>
      ))}
    </g>
  );
}

function PredictionError(props: SignalStatistics) {
  const { statistics, metadata, id } = props;
  const isExperimental = useCheckExperimentalFeature();
  const assignment = useAssignment(id);
  const highlight = useHighlight(extractID(id, assignment), {
    type: HighlightEventSource.SIGNAL,
  });

  const isAssignmentActive = assignment.isActive;
  const isHighlighted = highlight.isActive || isAssignmentActive;

  const { scaleX } = useScaleChecked();
  const { min, max, median, q1, q3, nb } = statistics;

  const yCenter = boxHeight / 2;
  const yTop = 0;
  const yBottom = boxHeight;

  const xQ1 = scaleX()(q1);
  const xQ3 = scaleX()(q3);
  const xMin = scaleX()(min);
  const xMax = scaleX()(max);
  const xMedian = scaleX()(median);

  const boxPath = `
    M ${xMin} ${yCenter} L ${xQ1} ${yCenter}
    M ${xQ1} ${yTop} L ${xQ3} ${yTop} L ${xQ3} ${yBottom} L ${xQ1} ${yBottom} Z
    M ${xQ3} ${yCenter} L ${xMax} ${yCenter}
  `;

  const medianLine = `M ${xMedian} ${yTop} L ${xMedian} ${yBottom}`;

  const rectWidth = Math.abs(xMax - xMin) + boxPadding * 2;
  const rectHeight = boxHeight + boxPadding * 2;
  const x = xMax - boxPadding;
  const y = -boxPadding;

  const { hose, sphere } = metadata;
  return (
    <Popover
      targetTagName="g"
      interactionKind="hover"
      content={
        isExperimental ? (
          <InfoBlock hose={hose} sphere={sphere} nb={nb} />
        ) : undefined
      }
    >
      <g
        onMouseEnter={() => {
          assignment.highlight('x');
          highlight.show();
        }}
        onMouseLeave={() => {
          assignment.clearHighlight();
          highlight.hide();
        }}
      >
        <path d={boxPath} stroke="red" fill="transparent" strokeWidth={2} />
        <path d={medianLine} stroke="red" strokeWidth={2} />
        <Rect
          x={x}
          y={y}
          width={rectWidth}
          height={rectHeight}
          data-no-export="true"
          isHighlighted={isHighlighted}
        />
      </g>
    </Popover>
  );
}

interface InfoBlockProps {
  sphere: number;
  nb: number;
  hose: string;
}

function InfoBlock(props: InfoBlockProps) {
  const { sphere, nb, hose } = props;

  return (
    <Container>
      <InfoHeader>
        <Text>Sphere</Text>
        <Value>{sphere}</Value>
        <Text>Nb</Text>
        <Value>{nb}</Value>
      </InfoHeader>
      {hose && <IdcodeSvgRenderer idcode={hose} />}
    </Container>
  );
}

function extractID(id: string, assignment: AssignmentsData) {
  return [id].concat(assignment.assignedDiaIds?.x || []);
}
