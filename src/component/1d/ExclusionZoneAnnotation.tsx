/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { memo } from 'react';

import { ExclusionZone } from '../../data/types/data1d/ExclusionZone';
import { useScaleChecked } from '../context/ScaleContext';
import { HighlightEventSource, useHighlight } from '../highlight';
import useActiveSpectrumStyleOptions from '../hooks/useActiveSpectrumStyleOptions';

interface ExclusionZoneProps {
  zone: ExclusionZone;
  color: string;
  vAlign: number;
  spectrumID: string;
}

const style = css`
  &:hover {
    fill: #ff6f0057 !important;
  }
`;

function ExclusionZoneAnnotation({
  zone,
  color,
  vAlign,
  spectrumID,
}: ExclusionZoneProps) {
  const { scaleX, scaleY } = useScaleChecked();
  const highlight = useHighlight([], {
    type: HighlightEventSource.EXCLUSION_ZONE,
    extra: { zone, spectrumID },
  });

  const { opacity } = useActiveSpectrumStyleOptions(spectrumID);

  return (
    <g key={zone.id} transform={`translate(${scaleX()(zone.to)},0)`}>
      <rect
        x="0"
        css={style}
        transform={`translate(0,${scaleY()(0) - (vAlign + 5)})`}
        width={`${scaleX()(zone.from) - scaleX()(zone.to)}`}
        height="10px"
        style={{
          fill: color,
          opacity,
        }}
        {...highlight.onHover}
      />
    </g>
  );
}

export default memo(ExclusionZoneAnnotation);
