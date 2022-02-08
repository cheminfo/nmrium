/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { memo } from 'react';
import { ExclusionZone as ExclusionZoneType } from '../../../data/types/data1d/ExclusionZone';

import { useScaleChecked } from '../../context/ScaleContext';
import { HighlightedSource, useHighlight } from '../../highlight';

const styles = css`
  pointer-events: bounding-box;
  user-select: 'none';
  -webkit-user-select: none; /* Chrome all / Safari all */
  -moz-user-select: none; /* Firefox all */
  .zone-area {
    height: 100%;
    fill: #dddddd;
    cursor: pointer;
  }
  .zone-area.active {
    fill: #ff6f0057;
  }
`;

interface ExclusionZoneProps {
  zone: ExclusionZoneType;
}

function ExclusionZone({ zone }: ExclusionZoneProps) {
  const { scaleX } = useScaleChecked();
  const highlight = useHighlight([zone.id], {
    type: HighlightedSource.TEMP_EXCLUSION_ZONE,
    extra: { id: zone.id },
  });

  return (
    <g
      key={zone.id}
      transform={`translate(${scaleX()(zone.to)},0)`}
      css={styles}
      {...highlight.onHover}
    >
      <rect
        x="0"
        width={`${scaleX()(zone.from) - scaleX()(zone.to)}`}
        className={`zone-area ${highlight.isActive ? 'active' : ''}`}
      />
    </g>
  );
}

export default memo(ExclusionZone);
