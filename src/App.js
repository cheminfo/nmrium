import React from 'react';
import logo from './logo.svg';
import './App.css';
import SpectrumChart from './component/spectrum-chart';
// import json from './component/test.json';
import json2 from './samples/test2.json';
import json1 from './samples/test1.json';

function App() {
  
  //  console.log(json);

  const width = 650;
  const height = 400;
  const margin = { top: 20, right: 40, bottom: 40, left: 40 };
  
   const data = [
    // array of spectra. They will share the same axis
    // each series is a React component in the SVG dom
    // if a series has to be rerender a new object in the array is created
    {
      id: "2",
      isHover: false,
      ...json1,
      color: undefined, // an array of colors for each segment of line. Use always modulo color.length to get the color
      isFid: true, // allows to determine the label of the axis
      is2D: false, // TODO: need to define where to put the spectrum if it is 1D
      color: "green"
    },
    // {
    //   id: "5",
    //   isHover: false,
      
    //   color: undefined, // an array of colors for each segment of line. Use always modulo color.length to get the color
    //   ...json2,

    //   isFid: true, // allows to determine the label of the axis
    //   is2D: false, // TODO: need to define where to put the spectrum if it is 1D
    //   color: "red"
    // }
  ];



  return (
    <div className="App">

      <SpectrumChart  width={width} height={height} data={data} margin={margin}  updateRange={(d)=>{console.log(d)}}/>

    </div>
  );
}

export default App;
