import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import { Button, Welcome } from '@storybook/react/demo';
import SpectrumChart from '../component/spectrum-chart';
import json1 from '../samples/test1.json';
import json2 from '../samples/test.json';

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


const data2 = [
  // array of spectra. They will share the same axis
  // each series is a React component in the SVG dom
  // if a series has to be rerender a new object in the array is created
  {
    id: "2",
    isHover: false,
    ...json2,
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

storiesOf('1d spectrum samples', module)
.add('sample 1 with 100 points', () =>   <SpectrumChart  width={width} height={height} data={data} margin={margin}  updateRange={(d)=>{console.log(d)}}/>)
.add('sample 2 (real sample) with more than 500k points',
() => 
<div>
 <p>it's seem to be we have lack of performance related to svg, any suggestion will be great. as you see in the spectruc chart i extract sample from jcamp file for real experiement and i get 500k of points, if you try to use tool at the above of the chart for exmple brush it will take time from chart to respond and rfresh itseld.</p> 
 <SpectrumChart  width={width} height={height} data={data2} margin={margin}  updateRange={(d)=>{console.log(d)}}/>
 </div>
 );

// storiesOf('Button', module)
//   .add('with text', () => <Button onClick={action('clicked')}>Hello Button</Button>)
//   .add('with some emoji', () => (
//     <Button onClick={action('clicked')}>
//       <span role="img" aria-label="so cool">
//         😀 😎 👍 💯
//       </span>
//     </Button>
//   ));
