/** @jsx jsx */
import { jsx, css } from '@emotion/core';

import { useChartData } from './context/ChartContext';

const styles = css`
  pointer-events: bounding-box;
  :hover .range-area {
    height: 100%;
    fill: #ff6f0057;
    cursor: pointer;
  }
  :hover .delete-button {
    height: 100%;
    fill: #ff6f0057;
    cursor: pointer;
  }
`;

const Ranges = () => {
  const { getScale, data } = useChartData();

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
