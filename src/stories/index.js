import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import { Button, Welcome } from '@storybook/react/demo';
import SpectrumChart from '../component/SpectrumChart';
import json1 from '../samples/test1.json';
import json2 from '../samples/test.json';
import ChartWindow from '../component/ChartWindow';

const width = 800;
const height = 300;
const margin = { top: 10, right: 20, bottom: 30, left: 0 };

const data = [
  {
    data: {
      x: { ...json2 }.x,
      re: { ...json2 }.y,
      im: { ...json2 }.y,
    },
    options: {
      display: {
        name: 'spectrum 101',
        color: 'red',
      },
      info: {
        nucleus: 'H1',
        isFid: false,
        isComplex: false,
      },
    },
  },
  {
    data: {
      x: { ...json2 }.x,
      re: { ...json2 }.y,
      im: { ...json2 }.y,
    },
    options: {
      display: {
        name: 'spectrum 102',
        color: 'blue',
      },
      info: {
        nucleus: 'H1',
        isFid: false,
        isComplex: false,
      },
    },
  },
  {
    data: {
      x: { ...json2 }.x,
      re: { ...json2 }.y,
      im: { ...json2 }.y,
    },
    options: {
      display: {
        name: 'spectrum 103',
        color: 'green',
      },
      info: {
        nucleus: 'H1',
        isFid: false,
        isComplex: false,
      },
    },
  }
];

storiesOf('1d spectrum samples', module)
  .add('13C 512k points', () => (
    <SpectrumChart width={width} height={height} data={data} margin={margin} />
  ))
  .add('sample 3 500k points with window container', () => (
    <div>
      <p>More than one Chart Window</p>

      <ChartWindow width={width} height={height} title="Spectrum Chart 1">
        <SpectrumChart data={data} margin={margin} />
      </ChartWindow>

      <ChartWindow width={width} height={height} title="Spectrum Chart 2">
        <SpectrumChart data={data} margin={margin} />
      </ChartWindow>
    </div>
  ));
