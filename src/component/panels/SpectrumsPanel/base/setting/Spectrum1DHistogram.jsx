import { xHistogram } from 'ml-spectra-processing';
import { memo, useMemo } from 'react';
import { Axis, BarSeries, Heading, Plot } from 'react-plot';

const Spectrum1DHistogram = memo(({ color = 'green', data }) => {
  const histogramData = useMemo(() => {
    const result = xHistogram(data.re, { logBaseX: 10, logBaseY: 10 });
    return result.x.reduce((acc, value, index) => {
      acc.push({ x: value, y: result.y[index] });
      return acc;
    }, []);
  }, [data.re]);

  return (
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
        displayMarker
        markerShape="circle"
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
  );
});

export default Spectrum1DHistogram;
