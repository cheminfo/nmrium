import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import reduce from '../util/reduce';


const Lines = ({ width, height, margin, data, domain }) => {
  // const {_data,setData} = useState(data);
  // const {_domain,setDomain} =domain(domain);

 

  const refPathsContainer = useRef();
  const[_data,setData] = useState(data);

  useEffect(()=>{
    let _data = [];
    for(let d of data){
      d.x = d.x.reverse();
      _data.push(d);
    };

    setData(_data);

  },[]);
  // function makePath(data) {
  //   const scale = getScale(domain);
  //   const pathPoints = mapArrayToPoints(data);

  //   console.log(pathPoints);

  //   let path = `M ${scale.x(pathPoints[0].x)} ${scale.y(pathPoints[0].y)}`;
  //   path += pathPoints.slice(1).map((point, i) => {
  //     return ` L ${scale.x(point.x)} ${scale.y(point.y)}`;
  //   });

  //   return path;
  // }





   function makePath(data) {

     console.log(data);
    const scale = getScale(domain);
    const pathPoints = reduce(data.x,data.y,{from:domain.x[1],to:domain.x[0]});

    console.log(pathPoints);

    let path = `M ${scale.x(pathPoints.x[0])} ${scale.y(pathPoints.y[0])}`;
    path += pathPoints.x.slice(1).map((point, i) => {
      return ` L ${scale.x(point)} ${scale.y(pathPoints.y[i])}`;
    });

    return path;
  }

  // function mapArrayToPoints(data) {
  //   const result = data.x.map((xValue, i) => {
  //     return { x: xValue, y: data.y[i] };
  //   });

  //   return simplify(result, 0.000000001, false);
  // }



  function getScale(domain) {
    const x = d3.scaleLinear(domain.x, [margin.left, width - margin.right]);
    const y = d3.scaleLinear(domain.y, [height - margin.bottom, margin.top]);
    return { x, y };
  }

  function generatePaths() {
    return _data.map((d, i) => {
      return (
        <path className="line" key={d.id} stroke={d.color} d={makePath(d)} />
      );
    });
  }

  return (
    <React.Fragment>
      {/* <defs>
        <clipPath id="clip">
          <rect
            width={`${width - margin.left - margin.right}`}
            height={`${height - margin.top - margin.bottom}`}
            x={`${margin.left}`}
            y={`${margin.top}`}
          />
        </clipPath>
      </defs> */}

      <g className="paths" ref={refPathsContainer} clipPath="url(#clip)">
        {generatePaths()}
      </g>
    </React.Fragment>
  );
};

export default Lines;

Lines.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  data: PropTypes.array.isRequired,
  margin: PropTypes.shape({
    top: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
    bottom: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }),
  domain: PropTypes.shape({
    x: PropTypes.array.isRequired,
    y: PropTypes.array.isRequired,
  }),
};

Lines.defaultProps = {
  width: 800,
  height: 800,
  data: [],
  margin: { top: 40, right: 40, bottom: 40, left: 40 },
  domain: { x: 0, y: 0 },
};
