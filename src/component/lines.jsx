import React, { useRef, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { xyReduce } from 'ml-spectra-processing';
import { ChartContext } from './context/chart-context';
// { width, height, margin, data, xDomain, yDomain, getScale }
const Lines = ({data}) => {
  const refPathsContainer = useRef();
  const { width, height, margin, xDomain, getScale } = useContext(
    ChartContext,
  );

  // const {data} = 
  const [_data, setData] = useState([data]);


  function makePath(data) {
    
    // const scale = getScale(xDomain, yDomain);
     console.log(xDomain);
    const scale = getScale();

    // const pathPoints = xyReduce(data.x, data.y, {
    //   from: xDomain[0],
    //   to: xDomain[1],
    // });


  console.log(data);
    const pathPoints = xyReduce(data.x, data.y, {
      from: xDomain[0],
      to: xDomain[1],
    });

    console.log(pathPoints);

    let path = `M ${scale.x(pathPoints.x[0])} ${scale.y(pathPoints.y[0])}`;

    path += pathPoints.x
      .slice(1)
      .map((point, i) => {
        return ` L ${scale.x(point)} ${scale.y(pathPoints.y[i])}`;
      })
      .join('');
    // console.log(path);

    // setPaths(path);

    return path;
  }


  
  useEffect(() => {
     
   console.log('domain changed')
   setData(data);

  },[xDomain]);

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

  return (
    <g>
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
        {_data.x && (
          <path
            className="line"
            key={_data.id}
            stroke={_data.color}
            d={makePath(_data)}
          />
        )}
      </g>
    </g>
  );
};

export default Lines;

Lines.contextTypes = {
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
