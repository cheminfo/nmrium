import { matrixHistogram } from 'ml-spectra-processing';
import { memo, useMemo } from 'react';
import { Axis, BarSeries, Heading, Plot } from 'react-plot';

const Spectrum1DHistogram = memo(({ color = 'red', data }) => {
  const histogramData = useMemo(() => {
    const result = matrixHistogram(data.z, { logBaseX: 10, logBaseY: 10 });
    return result.x.reduce((acc, value, index) => {
      acc.push({ x: value, y: result.y[index] });
      return acc;
    }, []);
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

export default Spectrum1DHistogram;
