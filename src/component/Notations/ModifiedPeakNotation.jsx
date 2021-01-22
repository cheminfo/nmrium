import { css } from '@emotion/react';

/** @jsxImportSource @emotion/react */

const styles2 = css`
  pointer-events: bounding-box;
  user-select: none;
  :hover .target {
    visibility: visible !important;
    cursor: pointer;
  }

  .target {
    visibility: hidden;
  }
`;

function DeleteButton() {
  return (
    <svg className="target">
      <rect rx="5" width="14" height="14" fill="#c81121" />
      <line x1="5" x2="10" y1="8" y2="8" stroke="white" strokeWidth="2" />
    </svg>
  );
}

function EditButton() {
  return (
    <svg className="target" transform="translate(0,16)">
      <rect rx="5" width="14" height="14" fill="#c81121" />
      <line x1="5" x2="10" y1="8" y2="8" stroke="white" strokeWidth="2" />
    </svg>
  );
}

export function ModifiedPeakNotation({
  id,
  x,
  y,
  value,
  color,
  decimalFraction,
}) {
  return (
    <g css={styles2} id={id} transform={`translate(${x},${y})`}>
      <line x1="0" x2="0" y1="-5" y2={-30} stroke={color} strokeWidth="1" />
      <text
        x="40"
        y="5"
        dy="0em"
        dx="0em"
        style={{ transform: 'rotate(-90deg)' }}
      >
        {parseFloat(value).toFixed(decimalFraction)}
      </text>
      <DeleteButton />
      <EditButton />
    </g>
  );
}

export default ModifiedPeakNotation;
