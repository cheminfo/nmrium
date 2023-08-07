import { Spectrum1D } from 'nmr-load-save';

import { useChartData } from '../../context/ChartContext';
import { useScaleChecked } from '../../context/ScaleContext';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import useSpectrum from '../../hooks/useSpectrum';
import { formatNumber } from '../../utility/formatNumber';
import { resolve } from '../utilities/intersectionResolver';
import { PeakEditionListener } from './PeakEditionManager';
import { HighlightEventSource, useHighlight } from '../../highlight';

const emptyData = { peaks: {}, info: {}, display: {} };
const notationWidth = 10;
const notationMargin = 2;

function getDecimalsCount(max: number, format: string) {
  const numberOfDigits = format.replace(/\./, '').length;
  const fractionDigits = format.split('.')[1].length;

  return (
    Math.max(String(max.toFixed(0)).length, numberOfDigits - fractionDigits) +
    fractionDigits
  );
}

function PeakAnnotationsTreeStyle() {
  const { displayerKey, xDomain } = useChartData();
  const { scaleX } = useScaleChecked();
  const spectrum = useSpectrum(emptyData) as Spectrum1D;
  const { deltaPPM } = usePanelPreferences('peaks', spectrum.info.nucleus);

  const decimalsCount = getDecimalsCount(xDomain[1], deltaPPM.format);
  const mapPeaks = spectrum.peaks.values
    .map((peak) => ({
      ...peak,
      scaleX: scaleX()(peak.x),
    }))
    .sort((p1, p2) => p2.x - p1.x);

  if (!mapPeaks?.length) return null;

  const peaks = resolve(mapPeaks, {
    key: 'scaleX',
    width: notationWidth,
    margin: notationMargin,
    groupMargin: 10,
  });

  return (
    <g className="peaks" clipPath={`url(#${displayerKey}clip-chart-1d)`}>
      <g transform={`translate(0,${decimalsCount * 10})`}>
        {peaks.map((group) => {
          return (
            <g
              key={group.meta.id}
              transform={`translate(${group.meta.groupStartX},0)`}
            >
              {group.group.map((item, index) => {
                const { id, x: value, scaleX } = item;
                const startX = index * (notationWidth + notationMargin);
                const x = scaleX - group.meta.groupStartX;
                return (
                  <PeakAnnotation
                    key={id}
                    startX={startX}
                    x={x}
                    id={id}
                    value={value}
                    format={deltaPPM.format}
                    color={spectrum.display.color}
                    peakEditionFieldPositon={{
                      x: group.meta.groupStartX + startX,
                      y: decimalsCount * 10,
                    }}
                  />
                );
              })}
            </g>
          );
        })}
      </g>
    </g>
  );
}

interface PeakAnnotationProps {
  startX: number;
  x: number;
  format: string;
  color: string;
  id: string;
  value: number;
  peakEditionFieldPositon: { x: number; y: number };
}
function PeakAnnotation(props: PeakAnnotationProps) {
  const { startX, format, color, id, value, x, peakEditionFieldPositon } =
    props;
  const highlight = useHighlight([id], {
    type: HighlightEventSource.PEAK,
    extra: { id },
  });
  return (
    <g
      onMouseEnter={() => highlight.show()}
      onMouseLeave={() => highlight.hide()}
    >
      <PeakEditionListener {...{ ...peakEditionFieldPositon, id, value }}>
        <text
          transform={`rotate(-90) translate(0 ${startX})`}
          dominantBaseline="middle"
          textAnchor="start"
          fontSize="11px"
          fill="black"
        >
          {formatNumber(value, format)}
        </text>
      </PeakEditionListener>
      <path
        d={`M ${startX} 5 v 5 L ${x} 20 v 5`}
        stroke={color}
        fill="transparent"
        strokeWidth={highlight.isActive ? '3px' : '1px'}
      />
    </g>
  );
}

export default PeakAnnotationsTreeStyle;
