import { Spectrum1D } from 'nmr-load-save';

import { useChartData } from '../../context/ChartContext';
import { useScaleChecked } from '../../context/ScaleContext';
import { useActiveSpectrum } from '../../hooks/useActiveSpectrum';
import useSpectrum from '../../hooks/useSpectrum';

import { formatNumber } from '../../utility/formatNumber';
import { PeakEditionListener } from './PeakEditionManager';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import { HighlightEventSource, useHighlight } from '../../highlight';
import { Peak1D } from 'nmr-processing';

const emptyData = { peaks: {}, info: {}, display: {} };

function PeakAnnotations() {
  const { displayerKey } = useChartData();
  const activeSpectrum = useActiveSpectrum();
  const { shiftY } = useScaleChecked();
  const spectrum = useSpectrum(emptyData) as Spectrum1D;

  return (
    <g className="peaks" clipPath={`url(#${displayerKey}clip-chart-1d)`}>
      <g transform={`translate(0,-${(activeSpectrum?.index || 0) * shiftY})`}>
        {spectrum.peaks.values.map((peak) => (
          <PeakAnnotation
            key={peak.id}
            spectrumId={spectrum.id}
            peak={peak}
            color="#730000"
            nucleus={spectrum.info.nucleus}
          />
        ))}
      </g>
    </g>
  );
}

interface PeakAnnotationProps {
  peak: Peak1D;
  spectrumId: string;
  color: string;
  nucleus: string;
}

function PeakAnnotation({
  peak,
  spectrumId,
  color,
  nucleus,
}: PeakAnnotationProps) {
  const { id, x, y } = peak;
  const sign = Math.sign(y);

  const { deltaPPM } = usePanelPreferences('peaks', nucleus);
  const highlight = useHighlight([id], {
    type: HighlightEventSource.PEAK,
    extra: { id },
  });
  const { scaleX, scaleY } = useScaleChecked();

  const sx = scaleX()(x);
  const sy = scaleY(spectrumId)(y) - 5;

  return (
    <g
      style={{ outline: 'none' }}
      transform={`translate(${sx}, ${sy})`}
      onMouseEnter={() => highlight.show()}
      onMouseLeave={() => highlight.hide()}
    >
      <line
        x1="0"
        x2="0"
        y1={sign === -1 ? 10 : 0}
        y2={sign === -1 ? 28 : -18}
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
        <text
          x="0"
          y={sign === -1 ? 26 : -10}
          dy="0"
          dx="0.35em"
          fontSize="11px"
          fill={color}
        >
          {formatNumber(x, deltaPPM.format)}
        </text>
      </PeakEditionListener>
    </g>
  );
}

export default PeakAnnotations;
