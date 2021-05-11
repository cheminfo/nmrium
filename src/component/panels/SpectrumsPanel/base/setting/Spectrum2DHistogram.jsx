import {
  xNoiseSanPlot,
} from 'ml-spectra-processing';
import { memo, useMemo } from 'react';
import { Axis, BarSeries, Heading, Plot } from 'react-plot';

const Spectrum2DHistogram = memo(({ color = 'red', data }) => {
  const histogramData = useMemo(() => {
    let matrix = prepareData(data.z);
    const { sanplot } = xNoiseSanPlot(matrix);
    const { x, y } = sanplot.positive;
    let result = new Array(x.length);
    for (let i = 0; i < x.length; i++) {
      result[i] = { x: x[i], y: y[i] };
    }
    return result;
  }, [data.z]);

  return (
    <div
      style={{
        borderTop: '1px solid #ededed',
        marginTop: '10px',
        paddingTop: '10px',
      }}
    >
      <Plot
        width={450}
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

export default Spectrum2DHistogram;

function prepareData(matrix) {
  let cols = matrix[0].length;
  let rows = matrix.length;
  let jump = Math.floor(cols * rows / 51200) || 1;
  const array = new Float64Array(cols * rows / jump >> 0);
  let index = 0;
  for (let i = 0; i < array.length; i += jump) {
    array[index++] = matrix[(i / rows) >> 0][i % rows];
  }
  return array;
}
