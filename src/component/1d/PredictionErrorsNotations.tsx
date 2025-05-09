import { isSpectrum1D } from '../../data/data1d/Spectrum1D/isSpectrum1D.js';
import { useScaleChecked } from '../context/ScaleContext.js';
import useSpectrum from '../hooks/useSpectrum.js';

interface Statistics {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  mean: number;
  lowerWhisker: number;
  upperWhisker: number;
}

interface SignalStatistics {
  statistics: Statistics;
  id: number;
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
      const { statistics, id } = signal as any;
      if (statistics) {
        result.push({ id, statistics });
      }
    }
  }

  return result;
}

export function PredictionErrorsNotations() {
  const data = useStatistics();

  if (!data || data?.length === 0) return null;

  return (
    <g transform={`translate(0,100)`}>
      {data.map(({ id, statistics }) => (
        <PredictionError key={id} statistics={statistics} />
      ))}
    </g>
  );
}

interface PredictionErrorProps {
  statistics: Statistics;
}

const boxHeight = 15;

function PredictionError(props: PredictionErrorProps) {
  const { statistics } = props;
  const { scaleX } = useScaleChecked();
  const { min, max, median, q1, q3 } = statistics;

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

  return (
    <g>
      <path d={boxPath} stroke="red" fill="transparent" strokeWidth={1} />
      <path d={medianLine} stroke="red" strokeWidth={2} />
    </g>
  );
}
