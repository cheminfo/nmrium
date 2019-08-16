import React, { useRef, useContext } from 'react';
import PropTypes from 'prop-types';
import { XY } from 'ml-spectra-processing';
import { ChartContext } from './context/ChartContext';
// { width, height, margin, data, xDomain, yDomain, getScale }
const LinesSeries = ({ data }) => {
  const refPathsContainer = useRef();
  const {
    width,
    height,
    margin,
    xDomain,
    getScale,
    verticalAlign,
    activeSpectrum,
  } = useContext(ChartContext);

  // const {data} =
  // const [_data, setData] = useState([data]);

  function makePath(data) {
    const { id, x, y } = data;
    const scale = getScale(id);
    const pathPoints = XY.reduce(x, y, {
      from: xDomain[0],
      to: xDomain[1],
    });

    let path = `M ${scale.x(pathPoints.x[0])} ${scale.y(pathPoints.y[0])}`;
    console.log('makePath', id);
    path += pathPoints.x
      .slice(1)
      .map((point, i) => {
        return ` L ${scale.x(point)} ${scale.y(pathPoints.y[i])}`;
      })
      .join('');

    return path;
    // }

    // }
  }

  // useEffect(() => {

  //  console.log('domain changed')
  //  console.log(data);
  // //  setData(data);

  // },[xDomain]);

  // useEffect(() => {
  //   const paths = data.map((d, i) => {
  //     return { path: makePath(d), id: d.id, color: d.color };
  //   });

  //   setPaths(paths);
  // }, [xDomain, yDomain]);

  // function getScale(xDomain, yDomain) {
  //   console.log(width);
  //   console.log(height);
  //   const x = d3.scaleLinear(xDomain, [width - margin.right, margin.left]);
  //   const y = d3.scaleLinear(yDomain, [height - margin.bottom, margin.top]);
  //   return { x, y };
  // }

  const IsActive = (id) => {
    return activeSpectrum === null
      ? true
      : id === activeSpectrum.id
      ? true
      : false;
  };

  return (
    <g key={'path'}>
      <defs>
        <clipPath id="clip">
          <rect
            width={`${width - margin.left - margin.right}`}
            height={`${height - margin.top - margin.bottom}`}
            x={`${margin.left}`}
            y={`${margin.top}`}
          />
        </clipPath>
      </defs>

      <g className="paths" ref={refPathsContainer} clipPath="url(#clip)">
        {data &&
          data[0] &&
          data[0].x &&
          data
            .filter((d) => d.isVisible === true)
            .map((d, i) => (
              // d.isVisible &&
              <path
                className="line"
                key={`line-${d.id}-${i}`}
                stroke={d.color}
                style={{ opacity: IsActive(d.id) ? 1 : 0.2 }}
                d={makePath(d)}
                transform={`translate(0,${i * verticalAlign})`}
              />
            ))}
      </g>
    </g>
  );
};

export default LinesSeries;

LinesSeries.contextTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  data: PropTypes.object,
  margin: PropTypes.shape({
    top: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
    bottom: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }),
  xDomain: PropTypes.array,
  yDomain: PropTypes.array,
  getScale: PropTypes.func,
};
