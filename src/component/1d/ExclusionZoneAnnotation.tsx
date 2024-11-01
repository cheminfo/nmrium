/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Filters1D } from 'nmr-processing';
import { memo } from 'react';

import type { ExclusionZone } from '../../data/types/data1d/ExclusionZone.js';
import { useScaleChecked } from '../context/ScaleContext.js';
import { HighlightEventSource, useHighlight } from '../highlight/index.js';
import useActiveSpectrumStyleOptions from '../hooks/useActiveSpectrumStyleOptions.js';

interface ExclusionZoneProps {
  zone: ExclusionZone;
  color: string;
  vAlign: number;
  spectrumID: string;
  filterId: string;
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
  filterId,
}: ExclusionZoneProps) {
  const { scaleX, scaleY } = useScaleChecked();
  const type =
    filterId === Filters1D.signalProcessing.id
      ? HighlightEventSource.MATRIX_GENERATION_EXCLUSION_ZONE
      : HighlightEventSource.EXCLUSION_ZONE;
  const highlight = useHighlight([], {
    type,
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
          fill: filterId === Filters1D.signalProcessing.id ? 'gray' : color,
          opacity,
        }}
        {...highlight.onHover}
      />
    </g>
  );
}

export default memo(ExclusionZoneAnnotation);
