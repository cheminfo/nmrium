import { jsx, css } from '@emotion/core';
/** @jsx jsx */
import { useCallback, useState, useEffect, useMemo } from 'react';

import { useAssignment } from '../../assignment';
import { useChartData } from '../../context/ChartContext';
import { useHighlight } from '../../highlight';
import { HighlightSignalConcatenation } from '../../panels/extra/constants/ConcatenationStrings';
import { SignalKindsToConsiderInIntegralsSum } from '../../panels/extra/constants/SignalsKinds';
import { checkSignalKinds } from '../../panels/extra/utilities/ZoneUtilities';
import { get2DXScale, get2DYScale } from '../utilities/scale';

import Signal from './Signal';

const stylesOnHover = css`
  pointer-events: bounding-box;
  @-moz-document url-prefix() {
    pointer-events: fill;
  }
  user-select: 'none';
  -webkit-user-select: none; /* Chrome all / Safari all */
  -moz-user-select: none; /* Firefox all */

  // // disabled because Resizable component appears now when hovering over it
  // :hover .range-area {
  //   height: 100%;
  //   fill: #ff6f0057;
  //   cursor: pointer;
  // }

  .delete-button {
    visibility: hidden;
  }
`;

const stylesHighlighted = css`
  pointer-events: bounding-box;

  @-moz-document url-prefix() {
    pointer-events: fill;
  }
  .Integral-area {
    // height: 100%;
    fill: #ff6f0057;
  }
  .delete-button {
    visibility: visible;
    cursor: pointer;
  }
`;

const Zone = ({ zoneData, onDelete }) => {
  const { x, y, id, signal } = zoneData;
  const assignmentZone = useAssignment(id);
  const highlightZone = useHighlight(
    [assignmentZone.id],
    // .concat(
    //   assignmentZone.assigned.x || [],
    //   assignmentZone.assigned.y || [],
    // ),
  );
  const { margin, width, height, xDomain, yDomain } = useChartData();
  const scaleX = get2DXScale({ margin, width, xDomain });
  const scaleY = get2DYScale({ margin, height, yDomain });
  const { from: x1, to: x2 } = x;
  const { from: y1, to: y2 } = y;

  const [reduceOpacity, setReduceOpacity] = useState(false);

  useEffect(() => {
    setReduceOpacity(
      !checkSignalKinds(zoneData, SignalKindsToConsiderInIntegralsSum),
    );
  }, [zoneData]);

  const deleteHandler = useCallback(() => {
    onDelete(id);
  }, [id, onDelete]);

  const DeleteButton = () => {
    return (
      <svg
        className="delete-button"
        x={scaleX(x1) - 20}
        y={scaleY(y1)}
        onClick={() => deleteHandler()}
        data-no-export="true"
        width="16"
        height="16"
      >
        <rect rx="5" width="16" height="16" fill="#c81121" />
        <line x1="5" x2="10" y1="8" y2="8" stroke="white" strokeWidth="2" />
      </svg>
    );
  };

  const signals = useMemo(() => {
    return signal.map((_signal, i) => (
      <Signal
        // eslint-disable-next-line react/no-array-index-key
        key={`zone_${id}_signal${i}`}
        signal={_signal}
        signalID={`${id}${HighlightSignalConcatenation}${i}`}
      />
    ));
  }, [id, signal]);

  return (
    <g
      css={
        highlightZone.isActive || assignmentZone.isActive
          ? stylesHighlighted
          : stylesOnHover
      }
      key={id}
      {...highlightZone.onHover}
    >
      <g transform={`translate(${scaleX(x1)},${scaleY(y1)})`}>
        <rect
          x="0"
          width={scaleX(x2) - scaleX(x1)}
          height={scaleY(y2) - scaleY(y1)}
          className="Integral-area"
          fill="#0000000f"
          stroke={reduceOpacity ? '#343a40' : 'darkgreen'}
          strokeWidth={reduceOpacity ? '0' : '1'}
        />
      </g>
      {signals}

      <DeleteButton />
    </g>
  );
};

Zone.defaultProps = {
  onDelete: () => null,
};

export default Zone;
