import React, { useRef, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { xyReduce } from 'ml-spectra-processing';
import { ChartContext } from './context/chart-context';
// { width, height, margin, data, xDomain, yDomain, getScale }
const Lines = ({data}) => {
  const refPathsContainer = useRef();
  const { width, height, margin, xDomain, getScale ,vericalAlign,activeSpectrum} = useContext(
    ChartContext,
  );

  // const {data} = 
  // const [_data, setData] = useState([data]);


  function makePath(data) {
     
  // console.log(data);

    // const scale = getScale(xDomain, yDomain);
    //  console.log(xDomain);
    const scale = getScale();

    // const pathPoints = xyReduce(data.x, data.y, {
    //   from: xDomain[0],
    //   to: xDomain[1],
    // });


  // console.log(data);


  // console.log(data);

    const pathPoints = xyReduce(data.x, data.y, {
      from: xDomain[0],
      to: xDomain[1],
    });

    // console.log(pathPoints);

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

  const IsActive = (id) =>{
     return (activeSpectrum == null)?true:(id == activeSpectrum.id )?true:false
  }

  return (
    <g key={"path"}>
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
        {data && data[0] && data[0].x &&  data.map((d, i) => ( 
          d.isVisible && 
          <path
            className="line"
            key={d.id}
            stroke={d.color}
            style={{opacity:(IsActive(d.id))?1:0.2}}
            d={makePath(d)}
            transform={`translate(0,${i*vericalAlign})`}
          />
        ))}
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
