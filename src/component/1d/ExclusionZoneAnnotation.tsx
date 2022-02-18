import { memo } from 'react';

import { ExclusionZone } from '../../data/types/data1d/ExclusionZone';
import { useScaleChecked } from '../context/ScaleContext';
import { HighlightedSource, useHighlight } from '../highlight';
import useActiveSpectrumStyleOptions from '../hooks/useActiveSpectrumStyleOptions';

interface ExclusionZoneProps {
  zone: ExclusionZone;
  color: string;
  vAlign: number;
  spectrumID: string;
}

function ExclusionZoneAnnotation({
  zone,
  color,
  vAlign,
  spectrumID,
}: ExclusionZoneProps) {
  const { scaleX, scaleY } = useScaleChecked();
  const highlight = useHighlight([zone.id], {
    type: HighlightedSource.EXCLUSION_ZONE,
    extra: { id: zone.id, spectrumID },
  });

  const { opacity } = useActiveSpectrumStyleOptions(spectrumID);

  return (
    <g key={zone.id} transform={`translate(${scaleX()(zone.to)},0)`}>
      <rect
        x="0"
        transform={`translate(0,${scaleY()(0) - (vAlign + 5)})`}
        width={`${scaleX()(zone.from) - scaleX()(zone.to)}`}
        height="10px"
        style={{
          fill: highlight.isActive ? '#ff6f0057' : color,
          opacity,
        }}
        {...highlight.onHover}
      />
    </g>
  );
}

export default memo(ExclusionZoneAnnotation);
