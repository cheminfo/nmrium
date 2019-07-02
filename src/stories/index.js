import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import { Button, Welcome } from '@storybook/react/demo';
import SpectrumChart from '../component/spectrum-chart';
import json1 from '../samples/test1.json';
import json2 from '../samples/test.json';
import ChartWindow from '../component/chart-window';

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
];


const data2 = [
  // array of spectra. They will share the same axis
  // each series is a React component in the SVG dom
  // if a series has to be rerender a new object in the array is created
  {
    id: "2",
    isHover: false,
    x:{...json2}.x.reverse(),
    y:{...json2}.y,
    color: undefined, // an array of colors for each segment of line. Use always modulo color.length to get the color
    isFid: true, // allows to determine the label of the axis
    is2D: false, // TODO: need to define where to put the spectrum if it is 1D
    color: "green"
  },

];

storiesOf('1d spectrum samples', module)
.add('sample 1 with 100 points', () =>   <SpectrumChart  width={width} height={height} data={data} margin={margin}  updateRange={(d)=>{console.log(d)}}/>)
.add('sample 2 (real sample) with more than 500k points',
() => 
<div>
 <p>improved performance by using function to reduce the number of points, the quality will increas whn you zoom in</p> 
 <SpectrumChart  width={width} height={height} data={data2} margin={margin}  updateRange={(d)=>{console.log(d)}}/>
 </div>
 )
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


 


