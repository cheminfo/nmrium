import { useCallback } from 'react';
/** @jsx jsx */
import { jsx, css } from '@emotion/core';

import { useChartData } from './context/ChartContext';
import { useDispatch } from './context/DispatchContext';
import { DELETE_RANGE } from './reducer/Actions';

const styles = css`
  pointer-events: bounding-box;
  user-select: 'none';
  -webkit-user-select: none; /* Chrome all / Safari all */
  -moz-user-select: none; /* Firefox all */

  :hover .range-area {
    height: 100%;
    fill: #ff6f0057;
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

const Ranges = () => {
  const { getScale, data } = useChartData();
  const dispatch = useDispatch();

  const deleteIntegral = useCallback(
    (id) => {
      dispatch({ type: DELETE_RANGE, rangeID: id });
    },
    [dispatch],
  );

  const DeleteButton = (props) => {
    return (
      <svg
        className="delete-button"
        x={-20}
        y={10}
        onClick={() => deleteIntegral(props.id)}
        data-no-export="true"
      >
        <rect rx="5" width="16" height="16" fill="#c81121" />
        <line x1="5" x2="10" y1="8" y2="8" stroke="white" strokeWidth="2" />
      </svg>
    );
  };

  return (
    <g clipPath="url(#clip)">
      {data &&
        data[0] &&
        data
          .filter((d) => d.isVisible === true)
          .map((d) => (
            <g key={d.id}>
              {d.ranges &&
                d.ranges.map((range) => (
                  <g
                    css={styles}
                    key={range.id}
                    transform={`translate(${getScale().x(range.to)},10)`}
                  >
                    <DeleteButton id={range.id} />
                    <rect
                      x="0"
                      width={`${getScale().x(range.from) -
                        getScale().x(range.to)}`}
                      height="6"
                      className="range-area"
                      fill="green"
                    />
                    <text
                      textAnchor="middle"
                      x={
                        (getScale().x(range.from) - getScale().x(range.to)) / 2
                      }
                      y="20"
                      fontSize="10"
                      fill="red"
                    >
                      {range.integral.toFixed(1)}
                    </text>
                  </g>
                ))}
            </g>
          ))}
    </g>
  );
};

export default Ranges;
