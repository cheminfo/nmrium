import { useScaleChecked } from '../../context/ScaleContext.js';
import { useHighlight } from '../../highlight/index.js';
import { useActiveSpectrum } from '../../hooks/useActiveSpectrum.js';
import { useTextMetrics } from '../../hooks/useTextMetrics.ts';
import { formatNumber } from '../../utility/formatNumber.js';

import { PeakEditionListener } from './PeakEditionManager.js';
import type { Peak, PeaksAnnotationsProps, PeaksSource } from './Peaks.js';
import { getHighlightExtraId, getHighlightSource } from './Peaks.js';

const textSize = 11;
const textXOffset = 2;
const labelHeight = 13;

function resolvePeaksCluster(
  overlapPeaksById: Record<string, boolean>,
  cluster: Peak[],
) {
  if (cluster.length === 0) return;

  let maxPeak = cluster[0];
  for (const p of cluster) {
    if (p.y > maxPeak.y) {
      maxPeak = p;
    }
  }
  for (const p of cluster) {
    overlapPeaksById[p.id] = p.id !== maxPeak.id;
  }
}

function resolveYOverlaps(
  overlapPeaksById: Record<string, boolean>,
  inputCluster: Peak[],
) {
  let lastLabelPosition = 0;
  let cluster: Peak[] = [];

  const sortedPeaks = inputCluster.toSorted((a, b) => b.y - a.y);
  for (const peak of sortedPeaks) {
    const { yInPixel } = peak;
    const labelPosition = yInPixel;
    const overlapY = Math.abs(labelPosition - lastLabelPosition) < labelHeight;

    if (overlapY) {
      cluster.push(peak);
    } else {
      resolvePeaksCluster(overlapPeaksById, cluster);
      cluster = [peak];
    }

    lastLabelPosition = labelPosition;
  }
  resolvePeaksCluster(overlapPeaksById, cluster);
}

function useDetectPeakOverlaps(peaks: Peak[], format: string) {
  const { getTextWidth } = useTextMetrics({ labelSize: textSize });
  const overlapPeaksById: Record<string, boolean> = {};

  let cluster: Peak[] = [];
  let lastLabelPosition = 0;

  for (const peak of peaks) {
    const { xInPixel, x } = peak;
    const label = formatNumber(x, format);
    const labelWidth = getTextWidth(label) + textXOffset;
    const labelPosition = xInPixel + labelWidth;

    const overlapX = Math.abs(labelPosition - lastLabelPosition) < labelWidth;

    if (overlapX) {
      // add to current overlap cluster
      cluster.push(peak);
    } else {
      // resolve the previous cluster
      resolveYOverlaps(overlapPeaksById, cluster);
      // Start a new cluster
      cluster = [peak];
    }

    if (!overlapX) {
      lastLabelPosition = labelPosition;
    }
  }

  resolveYOverlaps(overlapPeaksById, cluster);
  return overlapPeaksById;
}

function PeakAnnotations(props: PeaksAnnotationsProps) {
  const { peaks, peaksSource, spectrumKey, peakFormat } = props;
  const activeSpectrum = useActiveSpectrum();
  const { shiftY } = useScaleChecked();
  const overlapPeaksById = useDetectPeakOverlaps(peaks, peakFormat);

  return (
    <g className="peaks">
      <g transform={`translate(0,-${(activeSpectrum?.index || 0) * shiftY})`}>
        {peaks.map((peak) => {
          return (
            <PeakAnnotation
              key={peak.id}
              spectrumKey={spectrumKey}
              peak={peak}
              color="#730000"
              peaksSource={peaksSource}
              format={peakFormat}
              isOverlap={overlapPeaksById[peak.id]}
            />
          );
        })}
      </g>
    </g>
  );
}

function adjustValue(baseValue: number, isOverlap: boolean) {
  return isOverlap ? baseValue / 2 : baseValue;
}

const basePeakYCoordinates: Record<
  'positive' | 'negative',
  { y1: number; y2: number }
> = {
  positive: {
    y1: 0,
    y2: -18,
  },
  negative: {
    y1: 10,
    y2: 28,
  },
};

function getLineYCoordinates(sign: number, isOverlap: boolean) {
  const { negative, positive } = basePeakYCoordinates;
  if (sign === -1) {
    const { y1, y2 } = negative;
    return {
      y1: adjustValue(y1, isOverlap),
      y2: adjustValue(y2, isOverlap),
    };
  }
  const { y1, y2 } = positive;
  return {
    y1,
    y2: adjustValue(y2, isOverlap),
  };
}

interface PeakAnnotationProps {
  peak: Peak;
  spectrumKey: string;
  color: string;
  peaksSource: PeaksSource;
  format: string;
  isOverlap?: boolean;
}

function PeakAnnotation({
  peak,
  spectrumKey,
  color,
  peaksSource,
  format,
  isOverlap = false,
}: PeakAnnotationProps) {
  const { id, parentKeys, x, y, opacity } = peak;
  const sign = Math.sign(y);
  const highlight = useHighlight([id], {
    type: getHighlightSource(peaksSource),
    extra: {
      id: getHighlightExtraId(peaksSource, id, parentKeys),
      spectrumID: spectrumKey,
    },
  });
  const { scaleX, scaleY } = useScaleChecked();

  const sx = scaleX()(x);
  const sy = scaleY(spectrumKey)(y) - 5;

  const { y1, y2 } = getLineYCoordinates(sign, isOverlap);

  return (
    <g
      style={{ outline: 'none' }}
      transform={`translate(${sx}, ${sy})`}
      onMouseEnter={() => highlight.show()}
      onMouseLeave={() => highlight.hide()}
      opacity={opacity}
    >
      <line
        x1="0"
        x2="0"
        y1={y1}
        y2={y2}
        stroke={color}
        strokeWidth={highlight.isActive ? '3px' : '1px'}
      />
      <PeakEditionListener
        value={x}
        x={x}
        y={y}
        useScaleX
        useScaleY
        id={id}
        dy={sign === -1 ? 0 : -26}
      >
        {!isOverlap && (
          <text
            x="0"
            y={sign === -1 ? 26 : -10}
            dy="0"
            dx={`${textXOffset}px`}
            fontSize={`${textSize}px`}
            fill={color}
          >
            {formatNumber(x, format)}
          </text>
        )}
      </PeakEditionListener>
    </g>
  );
}

export default PeakAnnotations;
