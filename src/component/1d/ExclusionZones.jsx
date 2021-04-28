/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useScale } from '../context/ScaleContext';
import { TYPES, useHighlight } from '../highlight';
import ExclusionZonesWrapper from '../hoc/ExclusionZonesWrapper';

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

const ExclusionZone = ({ zone }) => {
  const { scaleX } = useScale();
  const highlight = useHighlight([zone.id], TYPES.EXCLUSION_ZONE);
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
        className={`zone-area ${highlight.isActive && 'active'}`}
      />
    </g>
  );
};

function ExclusionZones({ exclusionZones }) {
  if (!exclusionZones) return null;

  return (
    <g className="exclusionZones">
      {exclusionZones.map((zone) => (
        <ExclusionZone key={zone.id} zone={zone} />
      ))}
    </g>
  );
}

export default ExclusionZonesWrapper(ExclusionZones);
