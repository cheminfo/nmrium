import React from 'react';
import logo from './logo.svg';
import './App.css';
import NMRDisplayer from './component/NMRDisplayer';
import ChartWindow from './component/ChartWindow';

import json from './samples/test.json';
import json2 from './samples/test2.json';
import json1 from './samples/test1.json';
import { Grid, Button } from '@material-ui/core';

function App() {
  //  console.log(json);

  const width = 600;
  const height = 300;
  const margin = { top: 10, right: 20, bottom: 30, left: 0 };

  const real_data = {
    id: '2',
    isHover: false,
    x: { ...json }.x,
    y: { ...json }.y,
    color: undefined, // an array of colors for each segment of line. Use always modulo color.length to get the color
    is2D: false, // TODO: need to define where to put the spectrum if it is 1D
    color: 'green',
    isVisible: true,
    isPeakMarkerVisible: true,
    isFid: true, // allows to determine the label of the axis
    nucleus: '1H',
    isComplex:false

  };

  const data = [
    // array of spectra. They will share the same axis
    // each series is a React component in the SVG dom
    // if a series has to be rerender a new object in the array is created
    // {
    //   id: '2',
    //   isHover: false,
    //   x: { ...json }.x.reverse(),
    //   y: { ...json }.y,
    //   name: 'spectrum 101',
    //   isFid: true, // allows to determine the label of the axis
    //   color: 'red',
    //   isVisible: true,
    //   isPeaksMarkersVisible: true,
    //   nucleus: '1H',
    // },
    // {
    //   id: '3',
    //   isHover: false,
    //   x: { ...json }.x.reverse(),
    //   y: { ...json }.y,
    //   name: 'spectrum 102',
    //   isFid: true, // allows to determine the label of the axis
    //   color: 'blue',
    //   isVisible: true,
    //   isPeaksMarkersVisible: true,
    //   nucleus: '1H',
    // },
    // {
    //   id: '4',
    //   isHover: false,
    //   x: { ...json }.x.reverse(),
    //   y: { ...json }.y,
    //   name: 'spectrum 103',
    //   isFid: true, // allows to determine the label of the axis
    //   color: 'green',
    //   isVisible: true,
    //   isPeaksMarkersVisible: true,
    //   nucleus: '13C',
    // },

    // {
    //   id: '3',
    //   isHover: false,
    //   x:{...json}.x,
    //   y:{...json}.y,
    //   color: undefined, // an array of colors for each segment of line. Use always modulo color.length to get the color
    //   isFid: true, // allows to determine the label of the axis
    //   is2D: false, // TODO: need to define where to put the spectrum if it is 1D
    //   color: 'red',
    // },
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

  // function reOrderArray() {
  //   let _data = [];
  //   for (let d of data) {
  //     d.x = d.x.reverse();
  //     _data.push(d);
  //   }
  //   return _data;
  // }

  return (
    //   setData(_data);

    <div className="App">

          <NMRDisplayer
            width={width}
            height={height}
            data={data}
            margin={margin}
            mode="RTL"
          />
      
      {/* 
<Window
        color='#cc7f29'
        theme='dark'
        chrome
        height="800px"
        padding="12px"
        background='white'
      >
        <TitleBar title="Spectrum Chart" controls/> */}
      {/* <Text color={this.props.theme === 'dark' ? 'white' : '#333'}>Hello World</Text> */}
      {/* <ChartWindow width={width} height={height} title="Spectrum Chart">
      <SpectrumChart
          data={real_data}
          margin={margin}
        />
      </ChartWindow>
       */}

      {/* <SpectrumChart
          width={width}
          height={height}
          data={reOrderArray()}
          margin={margin}
          updateRange={(d) => {
            console.log(d);
          }}
        /> */}

      {/* </Window> */}
    </div>
  );
}

export default App;
