import {
  xHistogram,
  xAbsolute,
  xMinMaxValues,
  xNoiseSanPlot,
} from 'ml-spectra-processing';
import { memo, useMemo } from 'react';
import { Axis, BarSeries, Heading, Plot } from 'react-plot';

const Spectrum1DHistogram = memo(({ color = 'red', data }) => {
  const histogramData = useMemo(() => {
    const input = prepareData(data.re);
    const { sanplot } = xNoiseSanPlot(input);
    const { x, y } = sanplot.positive;
    let result = new Array(x.length);
    for (let i = 0; i < x.length; i++) {
      result[i] = { x: x[i], y: y[i] };
    }
    return result;
  }, [data.re]);

  return (
    <div
      style={{
        borderTop: '1px solid #ededed',
        marginTop: '10px',
        paddingTop: '10px',
      }}
    >
      <Plot
        width={220}
        height={200}
        margin={{ bottom: 50, left: 10, top: 30, right: 10 }}
        // seriesViewportStyle={{ stroke: 'gray' }}
      >
        <Heading title="Histogram" />
        <BarSeries
          data={histogramData}
          xAxis="x"
          yAxis="y"
          lineStyle={{
            stroke: color,
          }}
          markerStyle={{
            fill: color,
            stroke: color,
          }}
        />
        <Axis
          id="x"
          position="bottom"
          displayGridLines
          tickStyle={{ fontSize: '0.7rem' }}
        />
        <Axis id="y" position="left" displayGridLines hidden />
      </Plot>
    </div>
  );
});

export default Spectrum1DHistogram;

function prepareData(input) {
  let length = input.length;
  let jump = Math.floor(length / 24576) || 1;
  const array = new Float64Array((length / jump) >> 0);
  let index = 0;
  for (let i = 0; i < array.length; i += jump) {
    array[index++] = input[i];
  }
  return array;
}
