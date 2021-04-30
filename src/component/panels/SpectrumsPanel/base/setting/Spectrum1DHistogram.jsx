import { xHistogram, xAbsolute, xMinMaxValues } from 'ml-spectra-processing';
import { memo, useMemo } from 'react';
import { Axis, BarSeries, Heading, Plot } from 'react-plot';

const Spectrum2DHistogram = memo(({ color = 'red', data }) => {
  const histogramData = useMemo(() => {
    console.log(data.re);
    const array = prepareData(data.re);
    const result = xHistogram(array, {
      logBaseX: 10,
      logBaseY: 2,
      nbSlots: 100,
    });
    return result.x.reduce((acc, value, index) => {
      acc.push({ x: value, y: result.y[index] });
      return acc;
    }, []);
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

export default Spectrum2DHistogram;

function prepareData(array) {
  array = xAbsolute(array);
  // we will shift of the minValue that is not 0
  let { min, max } = xMinMaxValues(array);
  if (min < 1) {
    if (max > 1e6) min = 1;
  }
  for (let i = 0; i < array.length; i++) {
    array[i] += min;
  }
  return array;
}
