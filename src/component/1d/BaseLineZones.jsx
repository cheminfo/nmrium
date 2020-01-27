import { useCallback, Fragment } from 'react';
/** @jsx jsx */
import { jsx, css } from '@emotion/core';

import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { DELETE_BASE_LINE_ZONE } from '../reducer/Actions';

const styles = css`
  pointer-events: bounding-box;
  user-select: 'none';
  -webkit-user-select: none; /* Chrome all / Safari all */
  -moz-user-select: none; /* Firefox all */

  .zone-area {
    height: 100%;
    fill: #b8b8b857;
    cursor: pointer;
  }
  .delete-button {
    display: none;
    cursor: pointer;
  }
  :hover .delete-button {
    display: block;
  }
`;

const BaseLineZones = () => {
  const { baseLineZones } = useChartData();

  const { getScale } = useChartData();
  const dispatch = useDispatch();

  const deleteRange = useCallback(
    (id) => {
      dispatch({ type: DELETE_BASE_LINE_ZONE, id });
    },
    [dispatch],
  );

  const DeleteButton = ({ id }) => {
    return (
      <Fragment>
        <svg
          className="delete-button"
          x={-20}
          y={10}
          onClick={() => deleteRange(id)}
          data-no-export="true"
        >
          <rect rx="5" width="16" height="16" fill="#c81121" />
          <line x1="5" x2="10" y1="8" y2="8" stroke="white" strokeWidth="2" />
        </svg>
      </Fragment>
    );
  };

  return (
    baseLineZones &&
    Array.isArray(baseLineZones) &&
    baseLineZones.length > 0 && (
      <g>
        {baseLineZones.map((zone) => (
          <g
            key={zone.id}
            transform={`translate(${getScale().x(zone.to)},0)`}
            css={styles}
          >
            <DeleteButton id={zone.id} />
            <rect
              x="0"
              width={`${getScale().x(zone.from) - getScale().x(zone.to)}`}
              className="zone-area"
            />
          </g>
        ))}
      </g>
    )
  );
};

export default BaseLineZones;
