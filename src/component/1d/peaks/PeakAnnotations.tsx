import { useScaleChecked } from '../../context/ScaleContext.js';
import { useHighlight } from '../../highlight/index.js';
import { useActiveSpectrum } from '../../hooks/useActiveSpectrum.js';
import { formatNumber } from '../../utility/formatNumber.js';

import { PeakEditionListener } from './PeakEditionManager.js';
import type { Peak, PeaksAnnotationsProps, PeaksSource } from './Peaks.js';
import { getHighlightExtraId, getHighlightSource } from './Peaks.js';

function PeakAnnotations(props: PeaksAnnotationsProps) {
  const { peaks, peaksSource, spectrumId, peakFormat } = props;
  const activeSpectrum = useActiveSpectrum();
  const { shiftY } = useScaleChecked();

  return (
    <g className="peaks">
      <g transform={`translate(0,-${(activeSpectrum?.index || 0) * shiftY})`}>
        {peaks.map((peak) => (
          <PeakAnnotation
            key={peak.id}
            spectrumId={spectrumId}
            peak={peak}
            color="#730000"
            peaksSource={peaksSource}
            format={peakFormat}
          />
        ))}
      </g>
    </g>
  );
}

interface PeakAnnotationProps {
  peak: Peak;
  spectrumId: string;
  color: string;
  peaksSource: PeaksSource;
  format: string;
}

export function PeakAnnotation({
  peak,
  spectrumId,
  color,
  peaksSource,
  format,
}: PeakAnnotationProps) {
  const { id, parentKeys, x, y } = peak;
  const sign = Math.sign(y);
  const highlight = useHighlight([id], {
    type: getHighlightSource(peaksSource),
    extra: { id: getHighlightExtraId(peaksSource, id, parentKeys) },
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
          {formatNumber(x, format)}
        </text>
      </PeakEditionListener>
    </g>
  );
}

export default PeakAnnotations;
