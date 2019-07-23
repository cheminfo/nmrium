import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import { Button, Welcome } from '@storybook/react/demo';
import SpectrumChart from '../component/spectrum-chart';
import json1 from '../samples/test1.json';
import json2 from '../samples/test.json';
import ChartWindow from '../component/chart-window';

  const width = 800;
  const height = 300;
  const margin = { top: 10, right: 20, bottom: 30, left: 0 };

const data = [
  // array of spectra. They will share the same axis
  // each series is a React component in the SVG dom
  // if a series has to be rerender a new object in the array is created
  {
    id: '2',
    isHover: false,
    x: { ...json2 }.x,
    y: { ...json2 }.y,
    name: 'spectrum 101',
    isFid: true, // allows to determine the label of the axis
    is2D: false, // TODO: need to define where to put the spectrum if it is 1D
    color: 'red',
    isVisible:true

  },
  {
    id: '3',
    isHover: false,
    x: { ...json2 }.x,
    y: { ...json2 }.y,
    name: 'spectrum 102',
    isFid: true, // allows to determine the label of the axis
    is2D: false, // TODO: need to define where to put the spectrum if it is 1D
    color: 'blue',
    isVisible:true

  },
  {
    id: '4',
    isHover: false,
    x: { ...json2 }.x,
    y: { ...json2 }.y,
    name: 'spectrum 103',
    isFid: true, // allows to determine the label of the axis
    is2D: false, // TODO: need to define where to put the spectrum if it is 1D
    color: 'green',
    isVisible:true

  },

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



const real_data ={
  id: '2',
  isHover: false,
  x:{...json2}.x.reverse(),
  y:{...json2}.y,
  isFid: true, // allows to determine the label of the axis
  is2D: false, // TODO: need to define where to put the spectrum if it is 1D
  color: 'green',
};



const data2 = [
  // array of spectra. They will share the same axis
  // each series is a React component in the SVG dom
  // if a series has to be rerender a new object in the array is created
  {
    id: "2",
    isHover: false,
    x:{...json2}.x,
    y:{...json2}.y,
    color: undefined, // an array of colors for each segment of line. Use always modulo color.length to get the color
    isFid: true, // allows to determine the label of the axis
    is2D: false, // TODO: need to define where to put the spectrum if it is 1D
    color: "green"
  },

];

storiesOf('1d spectrum samples', module)
.add('13C 512k points', () =>   <SpectrumChart  width={width} height={height} data={data} margin={margin} />)
.add('sample 3 500k points with window container',
() => 
<div>
 <p>More than one Chart Window</p> 

 <ChartWindow width={width} height={height} title="Spectrum Chart 1">
      <SpectrumChart
          data={data}
          margin={margin}
        />
      </ChartWindow>

      <ChartWindow width={width} height={height} title="Spectrum Chart 2">
      <SpectrumChart
          data={data}
          margin={margin}
        />
      </ChartWindow>
 </div>
 );


 


