import { xNoiseSanPlot } from 'ml-spectra-processing';
import { memo, useMemo } from 'react';
import { Axis, LineSeries, Legend, Plot } from 'react-plot';

function prepareData(matrix) {
  let cols = matrix[0].length;
  let rows = matrix.length;
  let jump = Math.floor((cols * rows) / 204800) || 1;
  const array = new Float64Array(((cols * rows) / jump) >> 0);
  let index = 0;
  for (let i = 0; i < array.length; i += jump) {
    array[index++] = matrix[(i / rows) >> 0][i % rows];
  }
  return array;
}

function getLine(value, data, options) {
  const { log10, abs } = Math;
  const { yLogBase } = options;
  const first = data.length > 0 ? data[0].x : 0;
  const last = data.length > 0 ? data[data.length - 1].x : 0;
  const inLogScale = log10(abs(value)) / log10(yLogBase);
  return [
    { x: first, y: inLogScale },
    { x: last, y: inLogScale },
  ];
}

interface Spectrum2DHistogramProps {
  color?: string;
  data: any;
  options?: any;
}

function Spectrum2DHistogram({
  color = 'red',
  data,
  options = {},
}: Spectrum2DHistogramProps) {
  const { yLogBase = 2 } = options;

  const processedData = useMemo(() => {
    const input = prepareData(data.z);
    const sanResult = xNoiseSanPlot(input, options);
    const sanPlot: any = {};
    const lines: any = {};
    for (let plotKey in sanResult.sanplot) {
      const { x, y } = sanResult.sanplot[plotKey];
      let result = new Array(x.length);
      for (let i = 0; i < x.length; i++) {
        result[i] = { x: x[i], y: y[i] };
      }
      sanPlot[plotKey] = result;
      lines[plotKey] = getLine(sanResult[plotKey], result, { yLogBase });
    }
    return { sanPlot, lines };
  }, [data.z, options, yLogBase]);

  return (
    <div>
      <span style={{ padding: '0 200px' }}>San Plot</span>

      <div
        style={{
          borderTop: '1px solid #ededed',
          marginTop: '10px',
          paddingTop: '10px',
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <Plot
          width={220}
          height={180}
          margin={{ bottom: 50, left: 40, top: 10, right: 13 }}
        >
          <LineSeries
            data={processedData.sanPlot.positive}
            xAxis="x"
            yAxis="y"
            label="positive"
            lineStyle={{
              stroke: color,
              strokeWidth: 1.2,
            }}
            markerStyle={{
              fill: color,
              stroke: color,
            }}
          />
          <LineSeries
            data={processedData.lines.positive}
            xAxis="x"
            yAxis="y"
            label="noise level"
            lineStyle={{
              stroke: 'blue',
              strokeWidth: 0.8,
              strokeDasharray: '3, 3',
            }}
            markerStyle={{
              fill: color,
              stroke: color,
            }}
          />
          <Axis
            id="x"
            label="Pt"
            position="bottom"
            tickStyle={{ fontSize: '0.6rem' }}
            labelStyle={{ fontSize: '0.6rem' }}
          />
          <Axis
            id="y"
            label={`Intensity [Log ${yLogBase}]`}
            position="left"
            tickStyle={{ fontSize: '0.6rem' }}
            labelStyle={{ fontSize: '0.7rem' }}
          />
          <Legend position="embedded" bottom={90} right={5} />
        </Plot>

        <Plot
          width={220}
          height={180}
          margin={{ bottom: 50, left: 40, top: 10, right: 13 }}
        >
          <LineSeries
            data={processedData.sanPlot.negative}
            xAxis="x"
            yAxis="y"
            label="negative"
            lineStyle={{
              stroke: color,
              strokeWidth: 1.2,
            }}
            markerStyle={{
              fill: color,
              stroke: color,
            }}
          />

          <LineSeries
            data={processedData.lines.negative}
            xAxis="x"
            yAxis="y"
            label="noise level"
            lineStyle={{
              stroke: 'blue',
              strokeWidth: 0.8,
              strokeDasharray: '3, 3',
            }}
            markerStyle={{
              fill: color,
              stroke: color,
            }}
          />

          <Axis
            id="x"
            label="Pt"
            position="bottom"
            tickStyle={{ fontSize: '0.6rem' }}
            labelStyle={{ fontSize: '0.5rem' }}
          />
          <Axis
            id="y"
            position="left"
            tickStyle={{ fontSize: '0.6rem' }}
            labelStyle={{ fontSize: '0.7rem' }}
          />
          <Legend position="embedded" bottom={90} right={5} />
        </Plot>
      </div>
    </div>
  );
}

export default memo(Spectrum2DHistogram);
